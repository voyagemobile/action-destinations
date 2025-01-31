import { ActionDefinition, IntegrationError } from '@segment/actions-core'
import type { Settings } from '../generated-types'
import type { Payload } from './generated-types'

const action: ActionDefinition<Settings, Payload> = {
  title: 'Identify User',
  description: 'Set the user ID for a particular device ID or update user properties',
  defaultSubscription: 'type = "identify"',
  fields: {
    user_id: {
      label: 'User ID',
      type: 'string',
      allowNull: true,
      description: 'The unique user identifier set by you',
      default: {
        '@path': '$.userId'
      }
    },
    anonymous_id: {
      label: 'Anonymous ID',
      type: 'string',
      allowNull: true,
      description: 'The generated anonymous ID for the user',
      default: {
        '@path': '$.anonymousId'
      }
    },
    traits: {
      label: 'User Properties',
      type: 'object',
      description: 'Properties to set on the user profile',
      default: {
        '@path': '$.traits'
      }
    }
  },

  perform: async (request, { payload, settings }) => {
    if (!settings.projectToken) {
      throw new IntegrationError('Missing project token')
    }
    const responses = []
    if (payload.anonymous_id) {
      const identifyEvent = {
        event: '$identify',
        properties: {
          $identified_id: payload.user_id,
          $anon_id: payload.anonymous_id,
          token: settings.projectToken
        }
      }

      const identifyResponse = await request('https://api.mixpanel.com/track', {
        method: 'post',
        body: new URLSearchParams({ data: JSON.stringify(identifyEvent) })
      })
      responses.push(identifyResponse)
    }

    if (payload.traits && Object.keys(payload.traits).length > 0) {
      const data = {
        $token: settings.projectToken,
        $distinct_id: payload.user_id,
        $set: payload.traits
      }

      const engageResponse = request('https://api.mixpanel.com/engage', {
        method: 'post',
        body: new URLSearchParams({ data: JSON.stringify(data) })
      })
      responses.push(engageResponse)
    }
    return Promise.all(responses)
  }
}

export default action
