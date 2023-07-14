import RestaurantCategory from '@modules/restaurants/domain/models/restaurant-category';

export default interface RestaurantCategoryRepository {

    find(id: string): Promise<RestaurantCategory | null>;

    findAll(): Promise<RestaurantCategory[]>;
}