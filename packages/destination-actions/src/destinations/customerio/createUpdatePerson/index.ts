import dayjs from '../../../lib/dayjs'
import type { ActionDefinition } from '@segment/actions-core'
import type { Settings } from '../generated-types'
import type { Payload } from './generated-types'
import { trackApiEndpoint } from '../utils'

const action: ActionDefinition<Settings, Payload> = {
  title: 'Create or Update Person',
  description: 'Create a person in Customer.io or update them if they exist.',
  defaultSubscription: 'type = "identify"',
  fields: {
    id: {
      label: 'Person ID',
      description:
        'The ID used to uniquely identify a person in Customer.io. [Learn more](https://customer.io/docs/identifying-people/#identifiers).',
      type: 'string',
      required: true,
      default: {
        '@path': '$.userId'
      }
    },
    anonymous_id: {
      label: 'Anonymous ID',
      description:
        'An anonymous ID for when no Person ID exists. [Learn more](https://customer.io/docs/anonymous-events/).',
      type: 'string',
      default: {
        '@path': '$.anonymousId'
      }
    },
    email: {
      label: 'Email Address',
      description: "The person's email address.",
      type: 'string',
      default: {
        '@template': '{{traits.email}}'
      }
    },
    created_at: {
      label: 'Created At',
      description: 'A timestamp of when the person was created.',
      type: 'string',
      default: {
        '@template': '{{traits.created_at}}'
      }
    },
    custom_attributes: {
      label: 'Person Attributes',
      description:
        'Optional attributes for the person. When updating a person, attributes are added or updated, not removed.',
      type: 'object',
      default: {
        '@path': '$.traits'
      }
    },
    convert_timestamp: {
      label: 'Convert Timestamps',
      description: 'Convert `created_at` to a Unix timestamp (seconds since Epoch).',
      type: 'boolean',
      default: true
    }
  },

  perform: (request, { settings, payload }) => {
    let createdAt: string | number | undefined = payload.created_at
    const body: Record<string, unknown> = {
      ...payload.custom_attributes,
      email: payload.email,
      anonymous_id: payload.anonymous_id
    }

    if (createdAt && payload.convert_timestamp !== false) {
      createdAt = dayjs.utc(createdAt).unix()
    }

    if (createdAt) {
      body.created_at = createdAt
    }

    return request(`${trackApiEndpoint(settings.accountRegion)}/api/v1/customers/${payload.id}`, {
      method: 'put',
      json: body
    })
  }
}

export default action
