import { CodeSnippet } from '~/components/CodeSnippet'
import {
  CouponExpiration,
  CouponFrequency,
  CouponTypeEnum,
  CreateCouponInput,
  TimezoneEnum,
  CurrencyEnum,
} from '~/generated/graphql'
import { formatDateToTZ } from '~/core/timezone'
import { envGlobalVar } from '~/core/apolloClient'
import { serializeAmount } from '~/core/serializers/serializeAmount'

const { apiUrl } = envGlobalVar()

const getSnippets = (coupon?: CreateCouponInput) => {
  if (!coupon || !coupon.code) return '# Fill the form to generate the code snippet'
  const {
    amountCents,
    amountCurrency,
    code,
    couponType,
    expiration,
    expirationAt,
    frequency,
    frequencyDuration,
    percentageRate,
  } = coupon

  return `# Assign a coupon to a customer
curl --location --request POST "${apiUrl}/api/v1/applied_coupons" \\
  --header "Authorization: Bearer $YOUR_API_KEY" \\
  --header 'Content-Type: application/json' \\
  --data-raw '{
    "applied_coupon": {
      "external_customer_id": "__EXTERNAL_CUSTOMER_ID__",
      "coupon_code": "${code}",
      ${
        couponType === CouponTypeEnum.FixedAmount
          ? `"coupon_type": "${couponType}",
      "amount_cents": ${serializeAmount(amountCents || 0, amountCurrency || CurrencyEnum.Usd)},
      "amount_currency": "${amountCurrency}",`
          : `"coupon_type": "${couponType}",
      "percentage_rate": ${percentageRate ? percentageRate : '__MUST_BE_DEFINED__'},`
      }
      ${
        frequency === CouponFrequency.Recurring
          ? `"frequency": "${frequency}",
      "frequency_duration": ${frequencyDuration ? frequencyDuration : '__MUST_BE_DEFINED__'},`
          : `"frequency": "${frequency}",`
      }
      ${
        expiration === CouponExpiration.TimeLimit
          ? `"expiration": "${expiration}",
      "expiration_date": ${expirationAt ? expirationAt : '__MUST_BE_DEFINED__'},`
          : `"expiration": "${formatDateToTZ(expiration, TimezoneEnum.TzUtc)}",`
      }
    }
  }'
  
# To use the snippet, don’t forget to edit your __YOUR_API_KEY__ and  __EXTERNAL_CUSTOMER_ID__`
}

interface CouponCodeSnippetProps {
  loading?: boolean
  coupon?: CreateCouponInput
}

export const CouponCodeSnippet = ({ coupon, loading }: CouponCodeSnippetProps) => {
  return <CodeSnippet loading={loading} language="bash" code={getSnippets(coupon)} />
}
