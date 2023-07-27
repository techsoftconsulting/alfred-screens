export default interface RestaurantAvailability {
    items: { id: string; name: string; numberOfPeople: number; availableSlots: { start: string; end: string; date: string }[] }[];
}