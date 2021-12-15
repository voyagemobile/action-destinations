import type { DestinationDefinition } from '@segment/actions-core'
import type { Settings } from './generated-types'
import { defaultValues } from '@segment/actions-core'
import trackOrderPlaced from './trackOrderPlaced'

const destination: DestinationDefinition<Settings> = {
  name: 'Voyage',
  slug: 'actions-voyage',
  mode: 'cloud',

  authentication: {
    scheme: 'custom',
    fields: {
      apiKey: {
        label: 'API Key',
        description:
          'Voyage API key. You can create a new API key or find your existing API key in the Advanced section of your [Settings page](https://app.voyagetext.com/dashboard/settings/advanced).',
        type: 'string',
        required: true
      }
    },
    testAuthentication: () => {
      // Return a request that tests/validates the user's credentials.
      // If you do not have a way to validate the authentication fields safely,
      // you can remove the `testAuthentication` function, though discouraged.
      return true
    }
  },

  extendRequest: ({ settings }) => {
    return {
      headers: {
        'x-api-key': settings.apiKey
      }
    }
  },

  onDelete: async () => {
    // Return a request that performs a GDPR delete for the provided Segment userId or anonymousId
    // provided in the payload. If your destination does not support GDPR deletion you should not
    // implement this function and should remove it completely.
    return true
  },

  presets: [
    {
      name: 'Track Order Placed Event',
      subscribe: 'type = "track"',
      partnerAction: 'trackOrderPlaced',
      mapping: defaultValues(trackOrderPlaced.fields)
    }
  ],

  actions: {
    trackOrderPlaced
  }
}

export default destination
