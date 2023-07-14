import { Box } from '@main-components/Base/Box';
import { Icon } from '@main-components/Base/Icon';
import AppLayout from '@main-components/Layout/AppLayout';
import NoItems from '@main-components/Secondary/NoItems';
import useFindRestaurants from '@modules/restaurants/application/use-find-restaurants';
import Restaurant from '@modules/restaurants/domain/models/restaurant';
import RestaurantItem from '@modules/restaurants/ui/components/RestaurantItem';
import useNavigation from '@shared/domain/hooks/navigation/use-navigation';
import { Skeleton } from '@main-components/Base/Skeleton';
import SizingUtils from '@utils/misc/sizing-utils';
import { useTheme } from '@shared/ui/theme/AppTheme';
import Text from '@main-components/Typography/Text';
import RestaurantsCarousel from '@modules/restaurants/ui/screens/RestaurantsScreen/components/RestaurantsCarousel';
import { RESTAURANT_GRID_ITEM_SIZE } from '@modules/restaurants/ui/constants';

export default function RestaurantsScreen() {

    const { data: restaurants, loading, isRefetching, refetch } = useFindRestaurants({});
    const { data: newRestaurants, loading: loadingNews } = useFindRestaurants({
        isNew: true
    });

    const { data: suggestedRestaurants, loading: loadingSuggested } = useFindRestaurants({
        recommended: true
    });

    return (
            <AppLayout
                    title={'Restaurantes'}
                    loading={loading || loadingSuggested || loadingNews}
            >
                <Box
                        flex={1}
                        bg={'white'}
                        justifyContent={'center'}
                >

                    <RestaurantsCarousel
                            title={'Sugeridos'}
                            gap={'xl'}
                            restaurants={suggestedRestaurants ?? []}
                            loading={loadingSuggested}
                    />

                    <RestaurantsCarousel
                            title={'Nuevos'}
                            gap={'xl'}
                            restaurants={newRestaurants ?? []}
                            loading={loadingNews}
                    />

                    <RestaurantsList
                            gap={'xl'}
                            title={'Todos'}
                            loading={loading}
                            restaurants={restaurants ?? []}
                    />
                </Box>
            </AppLayout>
    );
}


function RestaurantsList({
    gap,
    title,
    loading,
    restaurants
}: {
    gap?: string;
    title?: string;
    loading: boolean;
    restaurants: Restaurant[];
}) {

    const { navigate } = useNavigation();

    if (!loading && restaurants.length == 0) {
        return (
                <Box mb={gap}>
                    <NoItems
                            title={'Sin novedades...'}
                            icon={
                                <Icon
                                        name={'list'}
                                        type={'feather'}
                                        color={'greyMain'}
                                        numberSize={100}
                                />
                            }
                    />
                </Box>
        );
    }

    if (loading) {
        return (
                <Box mb={gap}>
                    <GridContainer>
                        {
                            [...new Array(10)].map(el => {
                                return (
                                        <Box marginHorizontal={'m'}>
                                            <Skeleton
                                                    loading
                                                    type={'rectangle'}
                                                    height={'100%'}
                                                    style={{
                                                        width: RESTAURANT_GRID_ITEM_SIZE,
                                                        height: RESTAURANT_GRID_ITEM_SIZE,
                                                        aspectRatio: 1 / 1,
                                                        borderRadius: SizingUtils.mscale(20)
                                                    }}
                                            />
                                        </Box>

                                );
                            })
                        }
                    </GridContainer>
                </Box>

        );
    }

    return (
            <Box mb={gap}>
                {
                        !!title && (
                                <Title text={title} />
                        )
                }
                <GridContainer>
                    {
                        restaurants?.map((r) => {
                            return (
                                    <RestaurantItem
                                            item={r}
                                            onPress={() => {
                                                navigate('restaurants/[id]', {
                                                    id: r.id
                                                });
                                            }}
                                    />
                            );
                        })
                    }
                </GridContainer>
            </Box>
    );

}

function Title({ text }) {
    return (
            <Box
                    marginVertical={'m'}
            >
                <Text
                        bold
                        variant={'heading1'}
                >
                    {text}
                </Text>
            </Box>
    );
}

function GridContainer({ children }) {
    const theme = useTheme();

    return (
            <Box
                    paddingVertical={'l'}
                    bg={'white'}
                    /*  paddingHorizontal={'xl'}*/
                    style={{
                        display: 'grid',
                        gap: theme.spacing.l,
                        gridTemplateColumns: `repeat(auto-fill, minmax(${RESTAURANT_GRID_ITEM_SIZE}px, 1fr))`
                    }}
            >
                {children}
            </Box>
    );
}

