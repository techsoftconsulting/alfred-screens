import Promotion from '@modules/restaurants/domain/models/promotion';
import PromotionMapper from '@modules/restaurants/infrastructure/mappers/promotion-mapper';
import PromotionRepository from '@modules/restaurants/domain/repositories/promotion-repository';
import InMemoryConfigRepo from '@modules/restaurants/infrastructure/repositories/in-memory-config-repo';
import APIRepository from '@shared/infrastructure/api/api-repository';

const COLLECTION_NAME = 'promotion';

interface Props {
    configRepo: InMemoryConfigRepo;
}

export default class ApiPromotionRepository extends APIRepository implements PromotionRepository {

    constructor(private props: Props) {
        super(props);
    }

    async findAll(filters?: any): Promise<Promotion[]> {

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
            },
            {
                field: 'durationEnd',
                operator: '>=',
                value: new Date()
            }
        ];
        const config = await this.props.configRepo.getDoc('alfred', 'configurations');

        if (!config?.mallId) return [];

        defaultFilters.push({
            field: 'mallsIds',
            operator: 'array-contains',
            value: config.mallId
        });


        defaultFilters.push({
            field: 'available',
            operator: '==',
            value: true
        });


        const docs: any = await this.findByCriteriaRequest(COLLECTION_NAME, defaultFilters, undefined, undefined, true);
        return PromotionMapper.toDomainFromArray(docs);
    }


    async find(id: string): Promise<Promotion | null> {

        const doc: any = await this.get(`${COLLECTION_NAME}/${id}`, true);

        if (!doc) return null;
        return PromotionMapper.toDomain(doc);
    }


}