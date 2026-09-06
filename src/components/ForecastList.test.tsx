import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ForecastList from './ForecastList'
import type { ForecastDay } from '../types/weather'

const days: ForecastDay[] = [
  {
    date: '2024-01-01',
    minTemp: 8,
    maxTemp: 12,
    avgTemp: 10,
    description: 'clear sky',
    icon: '01d',
    entries: [],
  },
  {
    date: '2024-01-02',
    minTemp: 5,
    maxTemp: 9,
    avgTemp: 7,
    description: 'rain',
    icon: '10d',
    entries: [],
  },
]

describe('ForecastList', () => {
  it('renders one card per day', () => {
    render(<ForecastList days={days} units="metric" selectedDate={null} onSelectDay={() => {}} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('calls onSelectDay with the date when a card is clicked', async () => {
    const user = userEvent.setup()
    const onSelectDay = vi.fn()
    render(
      <ForecastList days={days} units="metric" selectedDate={null} onSelectDay={onSelectDay} />
    )

    await user.click(screen.getAllByRole('button')[0])
    expect(onSelectDay).toHaveBeenCalledWith('2024-01-01')
  })

  it('renders nothing when there are no days', () => {
    const { container } = render(
      <ForecastList days={[]} units="metric" selectedDate={null} onSelectDay={() => {}} />
    )
    expect(container).toBeEmptyDOMElement()
  })
})
