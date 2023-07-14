import ProductRepository from '@modules/restaurants/domain/repositories/product-repository';
import Product from '@modules/restaurants/domain/models/product';
import ProductMapper from '@modules/restaurants/infrastructure/mappers/product-mapper';
import APIRepository from '@shared/infrastructure/api/api-repository';

const COLLECTION_NAME = 'restaurant-product';

export default class ApiProductRepository extends APIRepository implements ProductRepository {

    async findAll(filters?: any): Promise<Product[]> {

        if (!filters.restaurantId) return [];

        const defaultFilters = [
            {
                field: 'available',
                operator: '==',
                value: true
            },
            {
                field: 'status',
                operator: '==',
                value: 'ACTIVE'
            },
            {
                field: 'restaurantId',
                operator: '==',
                value: filters.restaurantId
            }
        ];

        if (filters?.mallId) {
            defaultFilters.push({
                field: 'mallsIds',
                operator: 'array-contains',
                value: filters.mallId
            });
        }


        const docs: any = await this.findByCriteriaRequest(COLLECTION_NAME, defaultFilters, undefined, undefined, true);

        return ProductMapper.toDomainFromArray(docs);
    }

    async find(id: string): Promise<Product | null> {
        const doc: any = await this.get(`${COLLECTION_NAME}/${id}`, true);

        if (!doc) return null;

        return ProductMapper.toDomain(doc);
    }
}