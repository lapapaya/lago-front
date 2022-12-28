import styled from 'styled-components'

import { Skeleton, Button } from '~/components/designSystem'
import { theme, ListItemCss, PopperOpener } from '~/styles'

export const InvoiceListItem = () => {}

export const InvoiceListItemSkeleton = () => {
  return (
    <Grid>
      <Status>
        <Skeleton variant="circular" height={12} width={12} />
        <Skeleton variant="text" height={12} width={92} />
      </Status>
      <Skeleton variant="text" height={12} width={160} />
      <div />
      <div />
      <Skeleton variant="text" height={12} width={120} />
      <PopperOpener>
        <Button variant="quaternary" icon="dots-horizontal" disabled />
      </PopperOpener>
    </Grid>
  )
}

const Grid = styled.div`
  position: relative;
  ${ListItemCss};
  display: grid;
  grid-template-columns: 112px 160px 1fr 160px 112px;
  gap: ${theme.spacing(3)};
  align-items: center;
  padding: 0 ${theme.spacing(28)} 0 ${theme.spacing(12)};
`

const Status = styled.div`
  display: flex;
  align-items: center;
  > *:first-child {
    margin-right: ${theme.spacing(2)};
  }
`
