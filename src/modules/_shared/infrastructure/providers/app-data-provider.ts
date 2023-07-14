import ApiRestaurantRepository from '@modules/restaurants/infrastructure/repositories/api-restaurant-repository';
import ApiRestaurantCategoryRepository
    from '@modules/restaurants/infrastructure/repositories/api-restaurant-category-repository';
import ApiRestaurantMallRepository
    from '@modules/restaurants/infrastructure/repositories/api-restaurant-mall-repository';
import ApiPromotionRepository from '@modules/restaurants/infrastructure/repositories/api-promotion-repository';
import ApiProductRepository from '@modules/restaurants/infrastructure/repositories/api-product-repository';
import InMemoryConfigRepo from '@modules/restaurants/infrastructure/repositories/in-memory-config-repo';

const AppDataProvider = (userTokenId?: string) => {
    const defaultProps = {
        tokenId: userTokenId
    };

    const configRepo = new InMemoryConfigRepo();
    return {
        RestaurantRepository: new ApiRestaurantRepository({
            configRepo
        }),
        RestaurantCategoryRepository: new ApiRestaurantCategoryRepository(defaultProps),
        RestaurantMallRepository: new ApiRestaurantMallRepository(defaultProps),
        PromotionRepository: new ApiPromotionRepository({
            configRepo
        }),
        ProductRepository: new ApiProductRepository(defaultProps)
    };
};

export default AppDataProvider;
