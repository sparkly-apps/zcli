import * as sinon from 'sinon'
import { expect } from '@oclif/test'
import * as axios from 'axios'
import { request } from '@zendesk/zcli-core'
import createThemeImportJob from './createThemeImportJob'
import * as chalk from 'chalk'
import * as errors from '@oclif/core/lib/errors'

describe('createThemeImportJob', () => {
  beforeEach(() => {
    sinon.restore()
  })

  it('calls the jobs/themes/imports endpoint with the correct payload and returns the job', async () => {
    const requestStub = sinon.stub(request, 'requestAPI')
    const job = {
      id: '9999',
      status: 'pending',
      data: {}
    }

    requestStub.returns(Promise.resolve({ data: { job } }) as axios.AxiosPromise)

    expect(await createThemeImportJob('1234')).to.equal(job)

    expect(requestStub.calledWith('/api/v2/guide/theming/jobs/themes/imports', sinon.match({
      method: 'POST',
      data: {
        job: {
          attributes: {
            brand_id: '1234',
            format: 'zip'
          }
        }
      }
    }))).to.equal(true)
  })

  it('errors when creation fails', async () => {
    const errorStub = sinon.stub(errors, 'error').callThrough()

    sinon.stub(request, 'requestAPI').throws({
      response: {
        data: {
          errors: [{
            code: 'TooManyThemes',
            title: 'Maximum number of allowed themes reached'
          }]
        }
      }
    })

    try {
      await createThemeImportJob('1234')
    } catch {
      expect(errorStub.calledWith(`${chalk.bold('TooManyThemes')} - Maximum number of allowed themes reached`)).to.equal(true)
    }
  })
})
