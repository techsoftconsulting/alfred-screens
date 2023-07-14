import useService from '@shared/domain/hooks/use-service';
import UseQueryValue from '@shared/domain/models/use-query-value';
import QueryCreator from '@shared/domain/services/query-creator';
import useRepository from '@shared/domain/hooks/use-repository';
import QueryOptions from '@shared/domain/models/query-options';
import RestaurantAvailability from '@modules/restaurants/domain/models/restaurant-availability';
import RestaurantRepository from '@modules/restaurants/domain/repositories/restaurant-repository';

type ResponseQueryValue = Omit<UseQueryValue, 'data'> & {
    data?: RestaurantAvailability;
};

export default function useGetRestaurantAvailability(id: string, options?: QueryOptions): ResponseQueryValue {
    const repo = useRepository<RestaurantRepository>(
        'RestaurantRepository'
    );
    const queryCreator = useService<QueryCreator>('QueryCreator');

    const queryState: ResponseQueryValue = queryCreator.execute(
        {
            id: 'restaurant-availability',
            payload: {
                id: id
            },
            type: ''
        },
        () => repo.getAvailability(id),
        {
            ...options ?? {}
        }
    );

    return queryState;
}
