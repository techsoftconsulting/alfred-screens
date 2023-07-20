export default interface RestaurantAvailability {
    [day: string]: { id: string; name: string; availableSlots: string[] }[];
}