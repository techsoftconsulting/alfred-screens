import Restaurant from '@modules/restaurants/domain/models/restaurant';
import RestaurantRepository from '@modules/restaurants/domain/repositories/restaurant-repository';
import RestaurantMapper from '@modules/restaurants/infrastructure/mappers/restaurant-mapper';
import ArrayUtils from '@utils/misc/array-utils';
import DateTimeUtils from '@utils/misc/datetime-utils';
import RestaurantAvailability from '@modules/restaurants/domain/models/restaurant-availability';
import InMemoryConfigRepo from '@modules/restaurants/infrastructure/repositories/in-memory-config-repo';
import APIRepository from '@shared/infrastructure/api/api-repository';

const COLLECTION_NAME = 'store';
const AREAS_COLLECTION_NAME = 'restaurant-area';

interface Props {
    configRepo: InMemoryConfigRepo;
}

export default class ApiRestaurantRepository
    extends APIRepository
    implements RestaurantRepository {

    constructor(private props: Props) {
        super(props);
    }

    async findAll(filters?: any): Promise<Restaurant[]> {
        const defaultFilters = [
            {
                field: 'status',
                operator: '==',
                value: 'ACTIVE'
            },
            {
                field: 'type',
                operator: '==',
                value: 'RESTAURANT'
            }
        ];

        const config = await this.props.configRepo.getDoc('alfred', 'configurations');

        if (!config?.mallId) return [];

        defaultFilters.push({
            field: 'address',
            operator: '==',
            value: config.mallId
        });

        defaultFilters.push({
            field: 'available',
            operator: '==',
            value: true
        });

        if (filters?.categoryId) {
            defaultFilters.push({
                field: 'categoriesIds',
                operator: 'array-contains',
                value: filters.categoryId
            });
        }

        if (filters?.recommended) {
            defaultFilters.push({
                field: 'recommended',
                operator: '==',
                value: true
            });
        }

        if (filters?.isNew) {
            const date = new Date();
            const minDate = DateTimeUtils.startOfDay(
                DateTimeUtils.subtractDays(date, 7)
            );
            const maxDate = DateTimeUtils.endOfDay(date);

            defaultFilters.push({
                field: 'createdAt',
                operator: '>=',
                value: minDate
            });

            defaultFilters.push({
                field: 'createdAt',
                operator: '<=',
                value: maxDate
            });
        }

        if (filters.ids) {
            defaultFilters.push({
                field: 'id',
                operator: 'in',
                value: filters.ids
            });
        }

        const docs: any = await this.findByCriteriaRequest(COLLECTION_NAME, defaultFilters, undefined, undefined, true);

        if (filters.query && filters.query?.trim() !== '') {
            const filteredDocs = ArrayUtils.filterLike(
                docs,
                'name',
                filters.query
            );

            return RestaurantMapper.toDomainFromArray(filteredDocs);
        }

        return RestaurantMapper.toDomainFromArray(docs);
    }

    async find(id: string): Promise<Restaurant | null> {
        const doc: any = await this.get(`${COLLECTION_NAME}/${id}`, true);

        if (!doc) return null;

        return RestaurantMapper.toDomain(doc);
    }

    async getAvailability(id: string): Promise<RestaurantAvailability> {


        const doc: any = await this.get(`${COLLECTION_NAME}/${id}/availability`, true);

        if (!doc) return {
            items: []
        };

        return {
            items: doc
        };

    }

}
