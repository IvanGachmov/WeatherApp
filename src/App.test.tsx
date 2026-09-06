import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import * as api from './api/weatherApi'
import type { ForecastApiResponse } from './types/weather'

const sampleResponse: ForecastApiResponse = {
  city: { name: 'Paris', country: 'FR' },
  list: [
    {
      dt: 1704110400,
      dt_txt: '2024-01-01 12:00:00',
      main: { temp: 10, temp_min: 8, temp_max: 12, humidity: 60 },
      weather: [{ description: 'clear sky', icon: '01d' }],
      wind: { speed: 2 },
    },
    {
      dt: 1704196800,
      dt_txt: '2024-01-02 12:00:00',
      main: { temp: 9, temp_min: 7, temp_max: 11, humidity: 65 },
      weather: [{ description: 'few clouds', icon: '02d' }],
      wind: { speed: 3 },
    },
  ],
}

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('searches for a city and displays the resulting forecast', async () => {
    vi.spyOn(api, 'fetchForecastByCity').mockResolvedValue(sampleResponse)
    const user = userEvent.setup()

    render(<App />)
    await user.type(screen.getByLabelText(/city name/i), 'Paris')
    await user.click(screen.getByRole('button', { name: /search/i }))

    await waitFor(() => {
      expect(screen.getByText(/Paris, FR/)).toBeInTheDocument()
    })
    expect(api.fetchForecastByCity).toHaveBeenCalledWith('Paris', 'metric')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('shows an error message when the API request fails', async () => {
    vi.spyOn(api, 'fetchForecastByCity').mockRejectedValue(new Error('city not found'))
    const user = userEvent.setup()

    render(<App />)
    await user.type(screen.getByLabelText(/city name/i), 'Nowhereville')
    await user.click(screen.getByRole('button', { name: /search/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('city not found')
    })
  })

  it('shows hourly detail when a day card is selected', async () => {
    vi.spyOn(api, 'fetchForecastByCity').mockResolvedValue(sampleResponse)
    const user = userEvent.setup()

    render(<App />)
    await user.type(screen.getByLabelText(/city name/i), 'Paris')
    await user.click(screen.getByRole('button', { name: /search/i }))
    await waitFor(() => screen.getByText(/Paris, FR/))

    const dayButtons = screen.getAllByRole('button', { name: /clear sky|few clouds/i })
    await user.click(dayButtons[1])

    expect(screen.getByText(/hourly forecast for/i)).toBeInTheDocument()
  })

  it('re-fetches with the new units when the unit selector changes', async () => {
    vi.spyOn(api, 'fetchForecastByCity').mockResolvedValue(sampleResponse)
    const user = userEvent.setup()

    render(<App />)
    await user.type(screen.getByLabelText(/city name/i), 'Paris')
    await user.click(screen.getByRole('button', { name: /search/i }))
    await waitFor(() => screen.getByText(/Paris, FR/))

    await user.selectOptions(screen.getByRole('combobox'), 'imperial')

    await waitFor(() => {
      expect(api.fetchForecastByCity).toHaveBeenLastCalledWith('Paris', 'imperial')
    })
  })
})
