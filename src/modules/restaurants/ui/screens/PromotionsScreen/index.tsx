import AppLayout from '@main-components/Layout/AppLayout';
import { useFocusEffect } from '@shared/domain/navigation/use-focus-effect';
import { Box } from '@main-components/Base/Box';
import useNavigation from '@shared/domain/hooks/navigation/use-navigation';
import NoItems from '@main-components/Secondary/NoItems';
import { Icon } from '@main-components/Base/Icon';
import { Skeleton } from '@main-components/Base/Skeleton';
import useFindPromotions from '@modules/restaurants/application/promotions/use-find-promotions';
import Promotion from '@modules/restaurants/domain/models/promotion';
import TouchableOpacity from '@main-components/Utilities/TouchableOpacity';
import { Image } from '@main-components/Base/Image';
import { Grow } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Modal, ModalProps } from '@main-components/Base/Modal';
import { useTheme } from '@shared/ui/theme/AppTheme';
import useFindPromotion from '@modules/restaurants/application/promotions/use-find-promotion';
import { ActivityIndicator } from '@main-components/Base/ActivityIndicator';
import Text from '@main-components/Typography/Text';
import DateTimeUtils from '@utils/misc/datetime-utils';
import useFindRestaurant from '@modules/restaurants/application/use-find-restaurant';
import useParams from '@shared/domain/hooks/navigation/use-params';
import useFindConfigurations from '@modules/restaurants/application/config/use-find-configurations';
import useFindRestaurants from '@modules/restaurants/application/use-find-restaurants';
import Restaurant from '@modules/restaurants/domain/models/restaurant';
import ArrayUtils from '@utils/misc/array-utils';
import SizingUtils from '@utils/misc/sizing-utils';
import useEventBus from '@shared/domain/hooks/use-event-bus';
import UserVisitedPromotionEvent from '@modules/restaurants/domain/events/user-visited-promotion-event';
import UuidUtils from '@utils/misc/uuid-utils';
import ObjectUtils from '@utils/misc/object-utils';

export default function PromotionsScreen() {

    const params = useParams();
    const { data: config, loading: loadingConfig, refetch: refetchConfig } = useFindConfigurations();
    const { data: items, loading, isRefetching, refetch } = useFindPromotions({
        mallId: params?.mall == 'current' ? config?.mallId : undefined
    });

    const ids = ArrayUtils.uniq(items?.map(el => el.restaurantId) ?? []);
    const { data: restaurants, loading: loadingRestaurants } = useFindRestaurants({
        ids: ids
    }, {
        enabled: ids.length > 0
    });

    useFocusEffect(() => {
        /* refetch();
         refetchConfig();*/
    });

    return (
            <AppLayout
                    title={''}
                    loading={loading || loadingConfig || loadingRestaurants}
            >
                <Box
                        flex={1}
                        bg={'white'}
                        justifyContent={'center'}
                >

                    <PromotionsList
                            loading={loading}
                            items={items ?? []}
                            restaurants={restaurants}
                    />
                </Box>
            </AppLayout>
    );
}


function PromotionsList({
    loading,
    restaurants,
    items
}: {
    restaurants: Restaurant[],
    loading: boolean;
    items: Promotion[];
}) {
    const eventBus = useEventBus();

    const { navigate } = useNavigation();

    const [itemId, setItemId] = useState(null);

    if (!loading && items.length == 0) {
        return (
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
        );
    }

    if (loading) {
        return (
                <Box>
                    <GridContainer>
                        {
                            [...new Array(10)].map((el, idx) => {
                                return (
                                        <Box
                                                key={idx}
                                                maxWidth={'90%'}
                                                width={'100%'}
                                                marginHorizontal={'m'}
                                                alignSelf={idx % 2 == 0 ? 'flex-start' : 'flex-end'}
                                        >
                                            <Skeleton
                                                    loading
                                                    type={'rectangle'}
                                                    height={'100%'}
                                                    style={{
                                                        aspectRatio: 3 / 1,
                                                        borderRadius: ITEM_RADIUS
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
            <Box>
                <GridContainer>
                    {
                        items?.map((r, idx) => {
                            const restaurant = restaurants?.find(l => l.id == r.restaurantId);
                            const isEven = idx % 2 == 0;
                            return (
                                    <Box
                                            key={idx}
                                            maxWidth={'90%'}
                                            width={'100%'}
                                            alignSelf={idx % 2 == 0 ? 'flex-start' : 'flex-end'}
                                    >
                                        <PromoItem
                                                restaurant={restaurant}
                                                item={r}
                                                direction={isEven ? 'row' : 'row-reverse'}
                                                onPress={() => {
                                                    setItemId(r.id);
                                                    eventBus.publish(new UserVisitedPromotionEvent({
                                                        id: UuidUtils.persistenceUuid(),
                                                        data: {
                                                            id: r.id,
                                                            promotion: ObjectUtils.pick(r.toPrimitives(), ['id', 'name', 'description', 'imageUrl', 'restaurantId'])
                                                        },
                                                        occurredOn: new Date()
                                                    }));
                                                }}
                                        />
                                    </Box>

                            );
                        })
                    }
                </GridContainer>

                <PromotionDetailsModal
                        itemId={itemId}
                        visible={!!itemId}
                        onDismiss={() => {
                            setItemId(null);
                        }}
                />
            </Box>

    );
}

function PromotionDetailsModal(props: Partial<ModalProps> & { itemId: string }) {

    const { data: promotion, loading } = useFindPromotion(props.itemId, {
        enabled: !!props.itemId
    });
    const { data: restaurant, loading: loadingRestaurant } = useFindRestaurant(promotion?.restaurantId ?? '', {
        enabled: !!promotion?.restaurantId
    });
    const theme = useTheme();
    const { navigate } = useNavigation();
    const isLoading = loadingRestaurant || loading;

    const MODAL_HEIGHT = SizingUtils.vscale(300);
    return (
            <Modal
                    containerStyle={{}}
                    contentContainerStyle={{
                        boxShadow: 'none',
                        backgroundColor: 'white',
                        top: `calc(50% - ${MODAL_HEIGHT / 2}px)`,
                        maxWidth: 'calc(80%)'
                    }}
                    visible={props.visible}
                    onDismiss={props.onDismiss}
            >
                <Box
                        height={MODAL_HEIGHT}
                        flexDirection={'row'}
                >
                    {
                        isLoading ? (
                                <Box
                                        justifyContent={'center'}
                                        alignItems={'center'}
                                        flex={1}
                                >
                                    <ActivityIndicator size={'large'} />
                                </Box>
                        ) : (
                                <Box flex={1}>
                                    <Image
                                            resizeMode={'cover'}
                                            style={{
                                                borderRadius: ITEM_RADIUS,
                                                aspectRatio: 3 / 1
                                            }}
                                            source={{
                                                uri: promotion?.imageUrl
                                            }}
                                    />

                                    <Box mt={'m'}>
                                        <Text
                                                variant={'heading3'}
                                                bold
                                        >{promotion?.name}</Text>
                                    </Box>

                                    <Box mt={'m'}>
                                        <Text>{promotion?.description}</Text>
                                    </Box>

                                    <Box
                                            mt={'m'}
                                            flexDirection={'row'}
                                            alignItems={'center'}
                                    >
                                        <Text bold>Restaurante:</Text>
                                        <Box ml={'s'}><Text>{restaurant?.name}</Text></Box>
                                    </Box>

                                    <Box mt={'m'}>
                                        {
                                            promotion?.isAvailable ? (
                                                    <Box
                                                            p={'s'}
                                                            paddingHorizontal={'m'}
                                                            borderRadius={40}
                                                            style={{
                                                                width: 'fit-content'
                                                            }}
                                                            bg={'appSuccess'}
                                                    >
                                                        <Text color={'white'}>¡Promoción disponible!</Text>
                                                    </Box>
                                            ) : (
                                                    <Box
                                                            borderRadius={40}
                                                            style={{
                                                                width: 'fit-content'
                                                            }}
                                                            p={'s'}
                                                            paddingHorizontal={'m'}
                                                            bg={'dangerMain'}
                                                    >
                                                        <Text color={'white'}>Promoción caducada</Text>
                                                    </Box>
                                            )
                                        }
                                        {
                                                promotion?.isAvailable && (
                                                        <Box mt={'s'}>
                                                            <Text>* Promoción válida hasta
                                                                el <Text bold>{DateTimeUtils.format(promotion.endDate, 'DD/MM/YYYY')}</Text></Text>
                                                        </Box>
                                                )
                                        }
                                    </Box>

                                    <Box
                                            mt={'m'}
                                            flex={1}
                                            alignItems={'center'}
                                            justifyContent={'flex-end'}
                                    >
                                        <TouchableOpacity
                                                onPress={() => {
                                                    props.onDismiss?.();
                                                }}
                                        >
                                            <Box
                                                    justifyContent={'center'}
                                                    alignItems={'center'}
                                                    bg={'greyLight'}
                                                    borderRadius={SizingUtils.scale(25 / 2)}
                                                    width={SizingUtils.scale(25)}
                                                    height={SizingUtils.scale(25)}
                                            >
                                                <Icon
                                                        name={'close'}
                                                        type={'ionicon'}
                                                        color={'greyMain'}
                                                        numberSize={theme.textVariants.body1.fontSize + 40}
                                                />
                                            </Box>
                                        </TouchableOpacity>

                                    </Box>

                                </Box>
                        )
                    }

                </Box>

            </Modal>
    );
}

const ITEM_RADIUS = SizingUtils.mscale(10);

function PromoItem({ item, restaurant, direction, onPress }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(true);
    }, []);


    return (
            <Grow in={show}>
                <div>
                    <Box
                            borderRadius={ITEM_RADIUS}
                            bg={'greyLightest'}
                            marginHorizontal={'m'}
                    >
                        <TouchableOpacity
                                onPress={onPress}
                        >
                            <Box>

                                <Image
                                        resizeMode={'cover'}
                                        style={{
                                            borderRadius: ITEM_RADIUS,
                                            aspectRatio: 3 / 1
                                        }}
                                        source={{
                                            uri: item?.imageUrl
                                        }}
                                />
                                <OverlayItem />
                                <Box
                                        position={'absolute'}
                                        height={'100%'}
                                        width={'100%'}
                                        flexDirection={direction}
                                >
                                    <Box>
                                        <Box
                                                width={'100%'}
                                                height={'100%'}
                                                style={{
                                                    borderRadius: ITEM_RADIUS,
                                                    aspectRatio: 1 / 1
                                                }}
                                        >
                                            <Image
                                                    resizeMode={'cover'}
                                                    style={{
                                                        borderRadius: ITEM_RADIUS,
                                                        aspectRatio: 1 / 1
                                                    }}
                                                    source={{
                                                        uri: restaurant?.logoUrl
                                                    }}
                                            />
                                        </Box>
                                    </Box>
                                    <Box
                                            flex={1}
                                            justifyContent={'center'}
                                            alignItems={'center'}
                                    >
                                        <Text
                                                bold
                                                variant={'heading1'}
                                                color={'white'}
                                        >{item?.name}</Text>

                                        <Box mt={'m'}>
                                            <Text
                                                    variant={'body'}
                                                    color={'white'}
                                            >{item?.description} </Text>
                                        </Box>
                                    </Box>
                                </Box>

                            </Box>
                        </TouchableOpacity>
                    </Box>
                </div>
            </Grow>
    );
}

function OverlayItem() {
    return (
            <Box
                    borderRadius={ITEM_RADIUS}
                    position={'absolute'}
                    width={'100%'}
                    height={'100%'}
                    style={{
                        backgroundColor: 'rgba(0,0,0,0.5)'
                    }}
            >

            </Box>
    );
}

function GridContainer({ children }) {
    return (
            <Box
                    paddingVertical={'l'}
                    bg={'white'}
                    gap={'xxl'}
                    /*        paddingHorizontal={'xl'}*/
                    /* style={{
                         display: 'grid',
                         gap: '1em',
                         gridTemplateColumns: `repeat(auto-fill, minmax(350px, 1fr))`
                     }}*/
            >
                {children}
            </Box>
    );
}