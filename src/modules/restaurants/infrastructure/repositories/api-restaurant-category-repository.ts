import RestaurantCategoryRepository from '@modules/restaurants/domain/repositories/restaurant-category-repository';
import RestaurantCategory from '@modules/restaurants/domain/models/restaurant-category';
import APIRepository from '@shared/infrastructure/api/api-repository';

const COLLECTION_NAME = 'category';

export default class ApiRestaurantCategoryRepository extends APIRepository implements RestaurantCategoryRepository {

    async findAll(): Promise<RestaurantCategory[]> {
        const docs: any = await this.findByCriteriaRequest(COLLECTION_NAME, [
            {
                field: 'status',
                operator: '==',
                value: 'ACTIVE'
            }
        ], undefined, undefined, true);


        return docs.map(doc => {
            return {
                slug: doc.slug,
                id: doc.id,
                name: doc.name,
                status: doc.status
            };
        });
    }

    async find(id: string): Promise<RestaurantCategory | null> {
        const doc: any = await this.get(`${COLLECTION_NAME}/${id}`, true);

        if (!doc) return null;

        return {
            slug: doc.slug,
            id: doc.id,
            name: doc.name,
            status: doc.status
        };
    }

}