import { useRef } from 'react'
import styled, { css } from 'styled-components'
import { gql } from '@apollo/client'

import { intlFormatNumber } from '~/core/formats/intlFormatNumber'
import { Skeleton, Button, Typography, StatusEnum, Status, Popper } from '~/components/designSystem'
import { theme, BaseListItem, PopperOpener, ListItemLink, MenuPopper } from '~/styles'
import { addToast } from '~/core/apolloClient'
import { TimezoneDate } from '~/components/TimezoneDate'
import {
  InvoiceListItemFragment,
  InvoiceStatusTypeEnum,
  InvoicePaymentStatusTypeEnum,
  useDownloadInvoiceItemMutation,
  InvoiceForFinalizeInvoiceFragmentDoc,
} from '~/generated/graphql'
import { deserializeAmount } from '~/core/serializers/serializeAmount'
import { ListKeyNavigationItemProps } from '~/hooks/ui/useListKeyNavigation'
// import { useOrganizationTimezone } from '~/hooks/useOrganizationTimezone'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import { copyToClipboard } from '~/core/utils/copyToClipboard'

import { FinalizeInvoiceDialog, FinalizeInvoiceDialogRef } from './FinalizeInvoiceDialog'

gql`
  fragment InvoiceListItem on Invoice {
    id
    status
    paymentStatus
    number
    issuingDate
    totalAmountCents
    totalAmountCurrency
    customer {
      id
      name
      applicableTimezone
    }
    ...InvoiceForFinalizeInvoice
  }

  mutation downloadInvoiceItem($input: DownloadInvoiceInput!) {
    downloadInvoice(input: $input) {
      id
      fileUrl
    }
  }

  ${InvoiceForFinalizeInvoiceFragmentDoc}
`

enum InvoiceListItemContextEnum {
  customer = 'customer',
  organization = 'organization',
}

interface InvoiceListItemProps {
  context: keyof typeof InvoiceListItemContextEnum
  invoice: InvoiceListItemFragment
  navigationProps?: ListKeyNavigationItemProps
}

const mapStatusConfig = (
  status: InvoiceStatusTypeEnum,
  paymentStatus: InvoicePaymentStatusTypeEnum
) => {
  if (status === InvoiceStatusTypeEnum.Draft) {
    return { label: 'text_63ac8850ff7117ad55777d31', type: StatusEnum.paused }
  }

  if (paymentStatus === InvoicePaymentStatusTypeEnum.Succeeded) {
    return { label: 'text_63ac8850ff7117ad55777d4f', type: StatusEnum.running }
  }

  if (
    status === InvoiceStatusTypeEnum.Finalized &&
    paymentStatus === InvoicePaymentStatusTypeEnum.Failed
  ) {
    return { label: 'text_63ac8850ff7117ad55777d45', type: StatusEnum.failed }
  }

  if (
    status === InvoiceStatusTypeEnum.Finalized &&
    paymentStatus === InvoicePaymentStatusTypeEnum.Pending
  ) {
    return { label: 'text_63ac8850ff7117ad55777d3b', type: StatusEnum.draft }
  }
}

export const InvoiceListItem = ({ context, invoice, navigationProps }: InvoiceListItemProps) => {
  const { translate } = useInternationalization()
  const finalizeInvoiceRef = useRef<FinalizeInvoiceDialogRef>(null)
  const {
    id,
    status,
    paymentStatus,
    number,
    issuingDate,
    customer,
    totalAmountCents,
    totalAmountCurrency,
  } = invoice
  // const { formatTimeOrgaTZ } = useOrganizationTimezone()
  const statusConfig = mapStatusConfig(status, paymentStatus)
  const [downloadInvoice] = useDownloadInvoiceItemMutation({
    onCompleted({ downloadInvoice: data }) {
      const fileUrl = data?.fileUrl

      if (fileUrl) {
        // We open a window, add url then focus on different lines, in order to prevent browsers to block page opening
        // It could be seen as unexpected popup as not immediatly done on user action
        // https://stackoverflow.com/questions/2587677/avoid-browser-popup-blockers
        const myWindow = window.open('', '_blank')

        if (myWindow?.location?.href) {
          myWindow.location.href = fileUrl
          return myWindow?.focus()
        }

        myWindow?.close()
      } else {
        addToast({
          severity: 'danger',
          translateKey: 'text_62b31e1f6a5b8b1b745ece48',
        })
      }
    },
  })

  return (
    <Item to="#" tabIndex={0} {...navigationProps}>
      <GridItem>
        <Status
          type={statusConfig?.type as StatusEnum}
          label={translate(statusConfig?.label || '')}
        />
        <Typography variant="captionCode" color="grey700" noWrap>
          {number}
        </Typography>
        {context === InvoiceListItemContextEnum.organization && (
          <CustomerName color="grey700" noWrap>
            {customer?.name || '-'}
          </CustomerName>
        )}
        <Typography color="grey700" align="right">
          {intlFormatNumber(deserializeAmount(totalAmountCents, totalAmountCurrency), {
            currencyDisplay: 'symbol',
            currency: totalAmountCurrency,
          })}
        </Typography>
        <Typography color="grey700" align="right">
          <TimezoneDate date={issuingDate} customerTimezone={customer?.applicableTimezone} />
        </Typography>
      </GridItem>
      <Popper
        PopperProps={{ placement: 'bottom-end' }}
        opener={
          <PopperOpener>
            <Button icon="dots-horizontal" variant="quaternary" />
          </PopperOpener>
        }
      >
        {({ closePopper }) => (
          <MenuPopper>
            {status !== InvoiceStatusTypeEnum.Draft ? (
              <Button
                startIcon="download"
                variant="quaternary"
                align="left"
                onClick={async () => {
                  await downloadInvoice({
                    variables: { input: { id } },
                  })
                }}
              >
                {translate('text_62b31e1f6a5b8b1b745ece42')}
              </Button>
            ) : (
              <Button
                startIcon="checkmark"
                variant="quaternary"
                align="left"
                onClick={() => {
                  finalizeInvoiceRef.current?.openDialog(invoice)
                }}
              >
                {translate('text_63a41a8eabb9ae67047c1c08')}
              </Button>
            )}
            <Button
              startIcon="duplicate"
              variant="quaternary"
              align="left"
              onClick={() => {
                copyToClipboard(id)
                addToast({
                  severity: 'info',
                  translateKey: 'text_63ac86d897f728a87b2fa0b0',
                })
                closePopper()
              }}
            >
              {translate('text_63ac86d897f728a87b2fa031')}
            </Button>
          </MenuPopper>
        )}
      </Popper>
      <FinalizeInvoiceDialog ref={finalizeInvoiceRef} />
    </Item>
  )
}

export const InvoiceListItemSkeleton = () => {
  return (
    <SkeletonItem>
      <StatusBlock>
        <Skeleton variant="circular" height={12} width={12} />
        <Skeleton variant="text" height={12} width={92} />
      </StatusBlock>
      <Skeleton variant="text" height={12} width={160} />
      <div />
      <div />
      <Skeleton variant="text" height={12} width={120} />
      <PopperOpener>
        <Button variant="quaternary" icon="dots-horizontal" disabled />
      </PopperOpener>
    </SkeletonItem>
  )
}

const Grid = css`
  position: relative;
  display: grid;
  grid-template-columns: 112px 160px 1fr 160px 112px 40px;
  gap: ${theme.spacing(3)};
  align-items: center;
  width: 100%;
  /* padding: 0 ${theme.spacing(28)} 0 ${theme.spacing(12)}; */

  ${theme.breakpoints.down('md')} {
    grid-template-columns: 112px 1fr 160px 112px 40px;
    /* padding: 0 ${theme.spacing(20)} 0 ${theme.spacing(4)}; */
  }
`

const GridItem = styled.div`
  ${Grid}
`

const CustomerName = styled(Typography)`
  ${theme.breakpoints.down('md')} {
    display: none;
  }
`

const SkeletonItem = styled(BaseListItem)`
  ${Grid}
`

const Item = styled(ListItemLink)`
  position: relative;
`

const StatusBlock = styled.div`
  display: flex;
  align-items: center;
  > *:first-child {
    margin-right: ${theme.spacing(2)};
  }
`
