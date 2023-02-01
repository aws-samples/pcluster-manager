import {render, RenderResult, waitFor} from '@testing-library/react'
import {TimeZone} from '../AbsoluteTimestamp'
import DateView from '../DateView'

describe('Given a DateView component', () => {
  let renderResult: RenderResult

  describe('when only a string date is provided', () => {
    const dateString = '2022-09-16T14:03:35.000Z'
    const expectedResult = 'September 16, 2022 at 14:03 (UTC)'

    beforeEach(async () => {
      renderResult = await waitFor(() => render(<DateView date={dateString} />))
    })

    it('should render the date in the expected absolute format with default locales and timezone', async () => {
      expect(renderResult.getByText(expectedResult)).toBeTruthy()
    })
  })

  describe('when a date string, a locale and a timezone is provided', () => {
    const dateString = '2022-09-16T14:03:35.000Z'
    const locale = 'it-IT'
    const timeZone = TimeZone.UTC
    const expectedResult = '16 settembre 2022 14:03 (UTC)'

    beforeEach(async () => {
      renderResult = await waitFor(() =>
        render(
          <DateView date={dateString} locales={locale} timeZone={timeZone} />,
        ),
      )
    })

    it('should render the date in the expeted absolute format with provided locales and timezone', async () => {
      expect(renderResult.getByText(expectedResult)).toBeTruthy()
    })
  })
})
