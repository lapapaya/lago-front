import { generatePath, useParams } from 'react-router-dom'
import { gql } from '@apollo/client'
import styled from 'styled-components'

import { useInternationalization } from '~/hooks/core/useInternationalization'
import { Typography, NavigationTab, InfiniteScroll } from '~/components/designSystem'
import { INVOICES_TAB_ROUTE, INVOICES_ROUTE } from '~/core/router'
import {
  useInvoicesListQuery,
  InvoiceStatusTypeEnum,
  InvoicePaymentStatusTypeEnum,
} from '~/generated/graphql'
import { theme, PageHeader, ListHeader, ListContainer } from '~/styles'
import { GenericPlaceholder } from '~/components/GenericPlaceholder'
import ErrorImage from '~/public/images/maneki/error.svg'
import { InvoiceListItemSkeleton } from '~/components/invoices/InvoiceListItem'

gql`
  query invoicesList(
    $limit: Int
    $page: Int
    $status: InvoiceStatusTypeEnum
    $paymentStatus: [InvoicePaymentStatusTypeEnum!]
  ) {
    invoices(limit: $limit, page: $page, status: $status, paymentStatus: $paymentStatus) {
      metadata {
        currentPage
        totalPages
      }
      collection {
        id
      }
    }
  }
`

export enum InvoiceListTabEnum {
  'all' = 'all',
  'draft' = 'draft',
  'pendingFailed' = 'pendingFailed',
  'succeeded' = 'succeeded',
}

const InvoicesList = () => {
  const { tab } = useParams<{ tab?: InvoiceListTabEnum }>()
  const { translate } = useInternationalization()
  const { data, loading, error, fetchMore } = useInvoicesListQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      limit: 20,
      ...(tab === InvoiceListTabEnum.draft && { status: InvoiceStatusTypeEnum.Draft }),
      ...(tab === InvoiceListTabEnum.pendingFailed && {
        status: InvoiceStatusTypeEnum.Finalized,
        payementStatus: [InvoicePaymentStatusTypeEnum.Failed, InvoicePaymentStatusTypeEnum.Pending],
      }),
      ...(tab === InvoiceListTabEnum.succeeded && {
        paymentStatus: InvoicePaymentStatusTypeEnum.Succeeded,
      }),
    },
  })

  let index = -1

  console.log(data)

  return (
    <div>
      <PageHeader>
        <Typography variant="bodyHl" color="grey700">
          {translate('text_63ac86d797f728a87b2f9f85')}
        </Typography>
      </PageHeader>
      <NavigationTab
        tabs={[
          {
            title: translate('text_63ac86d797f728a87b2f9f8b'),
            link: generatePath(INVOICES_TAB_ROUTE, { tab: InvoiceListTabEnum.all }),
            match: [
              INVOICES_ROUTE,
              generatePath(INVOICES_TAB_ROUTE, { tab: InvoiceListTabEnum.all }),
            ],
          },
          {
            title: translate('text_63ac86d797f728a87b2f9f91'),
            link: generatePath(INVOICES_TAB_ROUTE, { tab: InvoiceListTabEnum.draft }),
          },
          {
            title: translate('text_63ac86d797f728a87b2f9f97'),
            link: generatePath(INVOICES_TAB_ROUTE, { tab: InvoiceListTabEnum.pendingFailed }),
          },
          {
            title: translate('text_63ac86d797f728a87b2f9fa1'),
            link: generatePath(INVOICES_TAB_ROUTE, { tab: InvoiceListTabEnum.succeeded }),
          },
        ]}
      />
      {!!error ? (
        <GenericPlaceholder
          title={translate('text_63ac86d797f728a87b2f9fea')}
          subtitle={translate('text_63ac86d797f728a87b2f9ff2')}
          buttonTitle={translate('text_63ac86d797f728a87b2f9ffa')}
          buttonVariant="primary"
          buttonAction={location.reload}
          image={<ErrorImage width="136" height="104" />}
        />
      ) : (
        <ListContainer>
          <GridLine $withActions>
            <Typography variant="bodyHl" color="grey500">
              {translate('text_63ac86d797f728a87b2f9fa7')}
            </Typography>
            <Typography variant="bodyHl" color="grey500">
              {translate('text_63ac86d797f728a87b2f9fad')}
            </Typography>
            <Typography variant="bodyHl" color="grey500" noWrap>
              {translate('text_63ac86d797f728a87b2f9fb3')}
            </Typography>
            <Typography variant="bodyHl" color="grey500" align="right">
              {translate('text_63ac86d797f728a87b2f9fb9')}
            </Typography>
            <Typography variant="bodyHl" color="grey500" align="right">
              {translate('text_63ac86d797f728a87b2f9fbf')}
            </Typography>
          </GridLine>
          <InfiniteScroll
          // onBottom={() => {
          //   const { currentPage = 0, totalPages = 0 } = data?.invoices?.metadata || {}

          //   currentPage < totalPages &&
          //     !loading &&
          //     fetchMore({
          //       variables: { page: currentPage + 1 },
          //     })
          // }}
          >
            {loading &&
              [0, 1, 2].map((_, i) => (
                <InvoiceListItemSkeleton key={`invoice-item-skeleton-${i}`} />
              ))}
          </InfiniteScroll>
        </ListContainer>
      )}
    </div>
  )
}

export default InvoicesList

const GridLine = styled(ListHeader)`
  display: grid;
  grid-template-columns: 112px 160px 1fr 160px 112px;
  gap: ${theme.spacing(3)};
`
