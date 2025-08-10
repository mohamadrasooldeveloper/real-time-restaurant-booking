// app/restaurants/[id]/page.js
import RestaurantMenuPage from './RestaurantMenuPage'

export default function Page({ params }) {
  const { id } = params

  return <RestaurantMenuPage restaurantId={id} />
}
