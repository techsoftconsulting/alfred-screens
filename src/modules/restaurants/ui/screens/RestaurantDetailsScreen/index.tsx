import { Box } from '@main-components/Base/Box';
import { Icon } from '@main-components/Base/Icon';
import { Image } from '@main-components/Base/Image';
import { Skeleton } from '@main-components/Base/Skeleton';
import { BaseInput } from '@main-components/Form/inputs/BaseInput';
import BaseSpinnerInput from '@main-components/Form/inputs/SpinnerInput/components/BaseSpinnerInput';
import AppLayout from '@main-components/Layout/AppLayout';
import Text from '@main-components/Typography/Text';
import TouchableOpacity from '@main-components/Utilities/TouchableOpacity';
import useFindRestaurantCategories from '@modules/restaurants/application/categories/use-find-restaurant-categories';
import useFindRestaurantMall from '@modules/restaurants/application/malls/use-find-restaurant-mall';
import useFindProducts from '@modules/restaurants/application/menu/use-find-products';
import useFindRestaurant from '@modules/restaurants/application/use-find-restaurant';
import Product from '@modules/restaurants/domain/models/product';
import Restaurant from '@modules/restaurants/domain/models/restaurant';
import RestaurantCategory from '@modules/restaurants/domain/models/restaurant-category';
import RestaurantMall from '@modules/restaurants/domain/models/restaurant-mall';
import useParams from '@shared/domain/hooks/navigation/use-params';
import React, { useEffect, useState } from 'react';
import useGetRestaurantAvailability from '@modules/restaurants/application/use-get-restaurant-availability';
import RestaurantAvailability from '@modules/restaurants/domain/models/restaurant-availability';
import DateTimeUtils from '@utils/misc/datetime-utils';
import { Modal, ModalProps } from '@main-components/Base/Modal';
import { useTheme } from '@shared/ui/theme/AppTheme';
import useNavigation from '@shared/domain/hooks/navigation/use-navigation';
import { CircularProgress } from '@main-components/Base/CircularProgress';
import QRCode from 'react-native-qrcode-svg';
import SizingUtils from '@utils/misc/sizing-utils';
import NoItems from '@main-components/Secondary/NoItems';
import useEventBus from '@shared/domain/hooks/use-event-bus';
import UserVisitedRestaurantEvent from '@modules/restaurants/domain/events/user-visited-restaurant-event';
import UuidUtils from '@utils/misc/uuid-utils';
import ObjectUtils from '@utils/misc/object-utils';
import UserBookedRestaurantTableEvent from '@modules/restaurants/domain/events/user-booked-restaurant-table-event';
import { ENV } from '@shared/infrastructure/utils/get-envs';

const BASE_RADIUS = SizingUtils.mscale(4);

export default function RestaurantDetailsScreen() {
    const params = useParams();
    const { data: restaurant, loading } = useFindRestaurant(params?.id);
    const { data: categories, loading: loadingCategories } =
            useFindRestaurantCategories();
    const { data: products, loading: loadingProducts } = useFindProducts({
        restaurantId: params?.id
    });

    const { data: mall, loading: loadingMall } = useFindRestaurantMall(
            restaurant?.mallId ?? '',
            { enabled: !!restaurant?.mallId }
    );

    const {
        data: availability,
        loading: loadingAvailability
    } = useGetRestaurantAvailability(params?.id, { enabled: !!params?.id });

    const eventBus = useEventBus();

    const isLoading = loadingCategories || loading || loadingMall || loadingProducts || loadingAvailability;

    useEffect(() => {
        if (!restaurant) return;
        if (isLoading) return;

        eventBus.publish(new UserVisitedRestaurantEvent({
            id: UuidUtils.persistenceUuid(),
            occurredOn: new Date(),
            data: {
                id: restaurant?.id,
                restaurant: ObjectUtils.omitUnknown({
                    ...ObjectUtils.pick(restaurant.toPrimitives(), ['id', 'name', 'logoUrl', 'mallId']),
                    mallId: restaurant!.mallId
                })
            }
        }));

    }, [restaurant, isLoading]);

    return (
            <AppLayout
                    title={'Detalle'}
                    loading={
                        isLoading
                    }
            >
                <Header restaurant={restaurant} />
                <RestaurantDescriptionSection restaurant={restaurant} />
                <RestaurantLocationSection
                        restaurant={restaurant}
                        mall={mall}
                />
                <RestaurantCategoriesSection
                        restaurant={restaurant}
                        loading={loadingCategories}
                        categories={categories}
                />

                <Box mt={'l'}>
                    <Box mb={'l'}>
                        <Text
                                variant={'heading1'}
                                bold
                        >
                            Horario
                        </Text>
                    </Box>
                    <Box>
                        <Text bold>{!!restaurant?.todaySchedule ? `${DateTimeUtils.format(restaurant.todaySchedule.startHour, 'hh:mm A')} - ${DateTimeUtils.format(restaurant.todaySchedule.endHour, 'hh:mm A')}` : 'Sin horario...'}</Text>
                    </Box>
                </Box>
                <RestaurantScheduleSection
                        availability={availability}
                        restaurant={restaurant}
                        products={products ?? []}
                        onPickSchedule={() => {

                        }}
                        onChangePeopleCount={() => {

                        }}
                />
            </AppLayout>
    );
}

function Header({ restaurant }: { restaurant?: Restaurant }) {
    const IMAGE_RADIUS = SizingUtils.mscale(20);
    const LOGO_IMAGE_SIZE = SizingUtils.mscale(100);
    return (
            <Box>
                <Box
                        width={'100%'}
                        maxWidth={'95%'}
                        justifyContent={'center'}
                        alignSelf={'center'}
                        mt={'m'}
                        style={{
                            marginBottom: SizingUtils.vscale(40)
                        }}
                >
                    <Box
                            bg={'greyLightest'}
                            style={{ borderRadius: IMAGE_RADIUS, aspectRatio: 2 / 1 }}
                    >
                        <Image
                                style={{
                                    borderRadius: IMAGE_RADIUS,
                                    aspectRatio: 2 / 1,
                                    resizeMode: 'cover'
                                }}
                                source={{ uri: restaurant?.coverImageUrl }}
                        />
                    </Box>

                    <Box
                            position={'absolute'}
                            width={'100%'}
                            alignItems={'center'}
                            justifyContent={'center'}
                            bottom={-100}
                    >
                        <Box
                                bg={'greyLightest'}
                                style={{
                                    borderRadius: SizingUtils.mscale(10),
                                    height: LOGO_IMAGE_SIZE,
                                    width: LOGO_IMAGE_SIZE
                                }}
                        >
                            <Image
                                    style={{
                                        borderRadius: SizingUtils.mscale(10),
                                        aspectRatio: 1 / 1,
                                        resizeMode: 'cover'
                                    }}
                                    source={{ uri: restaurant?.logoUrl }}
                            />
                        </Box>
                    </Box>
                </Box>
            </Box>
    );
}

function RestaurantDescriptionSection({
    restaurant
}: {
    restaurant?: Restaurant;
}) {
    if (!restaurant?.description) return <Box />;

    return (
            <Box mb={'xl'}>
                <Box mb={'m'}>
                    <Text
                            variant={'heading1'}
                            bold
                    >
                        Acerca de {restaurant?.name}
                    </Text>
                </Box>
                <Box>
                    <Text>{restaurant.description}</Text>
                </Box>
            </Box>
    );
}

function RestaurantLocationSection({
    restaurant,
    mall
}: {
    restaurant?: Restaurant;
    mall: RestaurantMall;
}) {
    if (!restaurant?.mallId) return <Box />;
    if (!mall) return <Box />;

    return (
            <Box mb={'xl'}>
                <Box mb={'m'}>
                    <Text
                            variant={'heading1'}
                            bold
                    >
                        Ubicación
                    </Text>
                </Box>
                <Box>
                    <Text>{mall.name}</Text>
                </Box>
            </Box>
    );
}

function RestaurantCategoriesSection({
    loading,
    categories,
    restaurant
}: {
    loading: boolean;
    categories: RestaurantCategory[];
    restaurant?: Restaurant;
}) {
    const filteredCategories = restaurant
            ? categories?.filter((c) => restaurant.categoriesIds.includes(c.id))
            : [];

    return (
            <Box>
                <Box mb={'l'}>
                    <Text
                            variant={'heading1'}
                            bold
                    >
                        Categoría
                    </Text>
                </Box>
                {loading ? (
                        <Box
                                flexDirection={'row'}
                                gap={'l'}
                        >
                            {[...new Array(3)]?.map((e, index) => {
                                return (
                                        <Skeleton
                                                key={index}
                                                loading
                                                type={'rectangle'}
                                                height={50}
                                                style={{
                                                    height: SizingUtils.mscale(30),
                                                    borderRadius: BASE_RADIUS,
                                                    width: SizingUtils.mscale(100)
                                                }}
                                        />
                                );
                            })}
                        </Box>
                ) : (
                        <Box
                                flexDirection={'row'}
                                gap={'l'}
                        >
                            {filteredCategories?.map((e) => {
                                return (
                                        <Box
                                                key={e.id}
                                                borderRadius={BASE_RADIUS}
                                                borderWidth={5}
                                                borderColor={'infoMain'}
                                                style={{
                                                    width: 'fit-content'
                                                }}
                                                p={'m'}
                                                paddingHorizontal={'l'}
                                        >
                                            <Text
                                                    bold
                                                    color={'infoMain'}
                                            >
                                                {e.name}
                                            </Text>
                                        </Box>
                                );
                            })}
                        </Box>
                )}
            </Box>
    );
}

function RestaurantScheduleSection({
    availability,
    restaurant,
    products,
    onPickSchedule,
    onChangePeopleCount
}: {
    onPickSchedule: any;
    onChangePeopleCount: any;
    availability?: RestaurantAvailability,
    restaurant?: Restaurant,
    products: Product[]
}) {
    const [selectedItem, setSelectedItem] = useState('reservations');
    const theme = useTheme();
    const MENU_ITEM_SIZE = SizingUtils.scale(55);

    const [inputData, setInputData] = useState({ numberOfPeople: 1, hour: null, date: null });

    return (
            <Box
                    flex={1}
                    minHeight={SizingUtils.vscale(100)}
                    marginVertical={'xl'}
            >
                <Box flexDirection={'row'}>
                    <TabItem
                            id={'reservations'}
                            selected={selectedItem == 'reservations'}
                            label={'Reservaciones'}
                            onPress={(id) => {
                                setSelectedItem(id);
                            }}
                    />
                    <TabItem
                            id={'menu'}
                            selected={selectedItem == 'menu'}
                            label={'Menú'}
                            onPress={(id) => {
                                setSelectedItem(id);
                            }}
                    />
                </Box>

                {selectedItem == 'reservations' && (
                        <Box
                                flex={1}
                                marginVertical={'l'}
                        >
                            <Text
                                    variant={'heading4'}
                                    bold
                            >
                                Horarios disponibles:
                            </Text>

                            <SchedulePicker
                                    schedule={availability}
                                    onPick={(schedule) => {
                                        setInputData({
                                            ...inputData,
                                            ...schedule
                                        });
                                    }}
                            />


                            <Box
                                    flexDirection={'row'}
                                    justifyContent={'space-between'}
                                    mt={'l'}
                            >
                                <Box>
                                    <Box mb={'m'}>
                                        <Text
                                                variant={'heading3'}
                                                bold
                                        >
                                            Número de personas
                                        </Text>
                                    </Box>
                                    <Box
                                            alignItems={'center'}
                                            flexDirection={'row'}
                                    >
                                        <Icon
                                                name={'user'}
                                                color={'black'}
                                                numberSize={SizingUtils.mscale(25)}
                                        />

                                        <Box
                                                maxWidth={SizingUtils.mscale(150)}
                                                ml={'l'}
                                        >
                                            <BaseInput
                                                    noMargin
                                                    WrapperComponent={Box}
                                                    bg={'white'}
                                            >
                                                <BaseSpinnerInput
                                                        min={1}
                                                        onChange={(count) => {
                                                            setInputData({
                                                                ...inputData,
                                                                numberOfPeople: count
                                                            });
                                                        }}
                                                />
                                            </BaseInput>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                )}

                {selectedItem == 'menu' && (
                        <Box flex={1}>
                            {
                                    products.length == 0 && (
                                            <Box
                                                    flex={1}
                                                    alignItems={'center'}
                                                    justifyContent={'center'}
                                            >
                                                <NoItems title={'Sin menú para mostrar'} />
                                            </Box>
                                    )
                            }
                            <Box
                                    flex={1}
                                    style={{
                                        display: 'grid',
                                        gap: theme.spacing.xl,
                                        gridTemplateColumns:
                                                `repeat(auto-fill, minmax(${MENU_ITEM_SIZE}px, 1fr))`
                                    }}
                                    marginVertical={'l'}
                            >

                                {products.map((el) => {
                                    return (
                                            <Box>
                                                <TouchableOpacity disabled>
                                                    <Box
                                                            borderRadius={SizingUtils.mscale(20)}
                                                            style={{
                                                                aspectRatio: 1 / 1
                                                            }}
                                                            alignItems={'center'}
                                                            bg={'greyLightest'}
                                                    >
                                                        <Image
                                                                source={{ uri: el.imageUrl }}
                                                                style={{
                                                                    resizeMode: 'cover',
                                                                    borderRadius: SizingUtils.mscale(20),
                                                                    width: '100%',
                                                                    aspectRatio: 1 / 1
                                                                }}
                                                        />
                                                    </Box>
                                                </TouchableOpacity>
                                                <Box mt={'s'}>
                                                    <Text align={'center'}>
                                                        {el.name} <br />
                                                        <Text bold>
                                                            {el.price.formattedValue} {el.unity}
                                                        </Text>
                                                    </Text>
                                                </Box>
                                            </Box>
                                    );
                                })}
                            </Box>
                        </Box>

                )}

                <Box
                        alignItems={'center'}
                        mt={'m'}
                >
                    <ReservationController
                            inputData={inputData}
                            restaurant={restaurant}
                    />
                </Box>
            </Box>
    );
}

function SchedulePicker({ schedule, onPick }) {

    const today = DateTimeUtils.format(new Date(), 'dddd')?.toUpperCase();
    const todayRow = schedule?.[today];

    const [selected, setSelected] = useState('');

    const [mode, setMode] = useState('collapsed');

    if (mode == 'collapsed') {

        return (
                <Box>
                    <Box
                            flexDirection={'row'}
                            gap={'l'}
                            mt={'m'}
                            flexWrap={'wrap'}
                    >
                        {
                                !todayRow || todayRow?.length == 0 &&
                                (
                                        <Box>
                                            <Text>Sin disponibilidad para hoy</Text>
                                        </Box>
                                )
                        }
                        {
                            todayRow?.map((el, key) => {
                                const isSelected = el + key == selected;
                                return (
                                        <TouchableOpacity
                                                key={key}
                                                onPress={() => {

                                                    setSelected(isSelected ? null : el + key);

                                                    onPick({
                                                        date: DateTimeUtils.format(new Date(), 'YYYY-MM-DD'),
                                                        hour: el
                                                    });

                                                }}
                                        >
                                            <Box
                                                    borderRadius={BASE_RADIUS}
                                                    borderWidth={5}
                                                    borderColor={isSelected ? 'appSuccess' : 'infoMain'}
                                                    p={'m'}
                                                    bg={isSelected ? 'appSuccess' : 'white'}
                                                    paddingHorizontal={'xl'}
                                            >
                                                <Text
                                                        bold
                                                        color={isSelected ? 'white' : 'infoMain'}
                                                >{el}</Text>
                                            </Box>
                                        </TouchableOpacity>
                                );
                            })
                        }
                    </Box>
                    <Box mt={'m'}>
                        <TouchableOpacity
                                onPress={() => {
                                    setMode('expanded');
                                }}
                        >
                            <Box
                                    borderRadius={BASE_RADIUS}
                                    borderWidth={5}
                                    borderColor={'infoMain'}
                                    p={'m'}
                                    paddingHorizontal={'xl'}
                            >
                                <Text
                                        align={'center'}
                                        bold
                                        color={'infoMain'}
                                >
                                    Ver disponibilidad completa
                                </Text>
                            </Box>
                        </TouchableOpacity>
                    </Box>
                </Box>

        );
    }

    return (
            <Box mt={'m'}>

                {
                    Object.keys(schedule ?? {})?.map((el, key) => {
                        const items = schedule[el];


                        const name = DateTimeUtils.getNameOfDay(el);
                        const isToday = today == el;

                        return (
                                <Box mb={'m'}>
                                    <Box mb={'s'}>
                                        <Text
                                                bold
                                                color={'black'}
                                        >{isToday ? 'Hoy' : name}:</Text>
                                    </Box>
                                    <Box
                                            flexDirection={'row'}
                                            gap={'l'}
                                            mt={'m'}
                                            flexWrap={'wrap'}
                                    >
                                        {
                                                items.length == 0 && (
                                                        <Box mb={'m'}>
                                                            <Text color={'greyMain'}>Sin disponibilidad</Text>
                                                        </Box>
                                                )
                                        }
                                        {
                                            items?.map((k, i) => {
                                                const isSelected = el + i == selected;
                                                return (
                                                        <TouchableOpacity
                                                                onPress={() => {
                                                                    if (!DateTimeUtils.getNext(el)) return;

                                                                    setSelected(isSelected ? null : el + i);
                                                                    onPick({
                                                                        date: DateTimeUtils.format(isToday ? new Date() : DateTimeUtils.getNext(el), 'YYYY-MM-DD'),
                                                                        hour: k
                                                                    });
                                                                }}
                                                        >
                                                            <Box
                                                                    borderRadius={BASE_RADIUS}
                                                                    borderWidth={5}
                                                                    borderColor={isSelected ? 'appSuccess' : 'infoMain'}
                                                                    p={'m'}
                                                                    bg={isSelected ? 'appSuccess' : 'white'}
                                                                    paddingHorizontal={'xl'}
                                                            >
                                                                <Text
                                                                        bold
                                                                        color={isSelected ? 'white' : 'infoMain'}
                                                                >{k}</Text>
                                                            </Box>
                                                        </TouchableOpacity>
                                                );
                                            })
                                        }


                                    </Box>
                                </Box>

                        );
                    })
                }

            </Box>

    );
}

function ReservationController({ restaurant, inputData }) {
    const [state, setState] = useState(false);
    const eventBus = useEventBus();

    const isInvalid = (() => {
        if (!inputData) return true;
        if (!inputData.numberOfPeople) return true;
        if (!inputData.hour) return true;
        if (!inputData.date) return true;
        return false;
    })();

    return (
            <>
                <ReservationButton
                        disabled={!restaurant || isInvalid}
                        title={'Reservar'}
                        backgroundColor={'appSuccess'}
                        style={{
                            width: '50%'
                        }}
                        onPress={() => {
                            if (!restaurant) return;
                            setState(true);
                            eventBus.publish(new UserBookedRestaurantTableEvent({
                                data: {
                                    id: restaurant.id,
                                    restaurant: ObjectUtils.omitUnknown({
                                        ...ObjectUtils.pick(restaurant.toPrimitives(), ['id', 'name', 'logoUrl', 'mallId']),
                                        mallId: restaurant!.mallId
                                    })
                                },
                                id: UuidUtils.persistenceUuid(),
                                occurredOn: new Date()
                            }));
                        }}
                />
                <ScanModal
                        visible={state}
                        data={{
                            ...inputData,
                            restaurantId: restaurant?.id
                        }}
                        onDismiss={() => {
                            setState(false);
                        }}
                />
            </>
    );
}


function ScanModal(props: Partial<ModalProps> & { data?: any }) {
    const theme = useTheme();
    const { navigate } = useNavigation();

    const MODAL_HEIGHT = SizingUtils.vscale(240);

    return (
            <Modal
                    containerStyle={{}}
                    contentContainerStyle={{
                        backgroundColor: theme.colors.primaryMain,
                        top: `calc(50% - ${MODAL_HEIGHT / 2}px)`,
                        borderRadius: SizingUtils.mscale(20),
                        maxWidth: `60%`,
                        height: MODAL_HEIGHT
                    }}
                    visible={props.visible}
                    onDismiss={props.onDismiss}
            >
                <Box
                        marginVertical={'l'}
                        alignSelf={'center'}
                >

                    <Box
                            flexDirection={'column'}
                            mb={'l'}
                            alignItems={'center'}
                    >

                        <QrGen
                                data={{
                                    ...props.data ?? {}
                                }}
                        />
                    </Box>
                    <Box mb={'xl'}>
                        <Text
                                variant={'heading4'}
                                align={'center'}
                                color={'white'}
                        >Escanea el código QR para completar tu registro</Text>
                    </Box>
                    <Box
                            alignItems={'center'}
                            justifyContent={'center'}
                    >
                        <CountdownComp
                                onTimeout={() => {
                                    props?.onDismiss?.();
                                }}
                        />
                    </Box>
                </Box>

            </Modal>
    );
}

function CountdownComp({ onTimeout }) {
    const max = 10;
    const [countdown, setCountdown] = useState(max); // Initial countdown value

    useEffect(() => {
        // Function to update the countdown every second
        const updateCountdown = () => {
            if (countdown > 0) {
                setCountdown(countdown - 1);
                return;
            }

            onTimeout?.();
        };

        const timer = setInterval(updateCountdown, 1000); // Update countdown every second

        return () => {

            clearInterval(timer); // Cleanup timer on unmounting component
        };
    }, [countdown]);

    const perce = countdown * 100 / max;

    return (
            <CircularProgress
                    activeStrokeColor={'dangerMain'}
                    textProps={{
                        color: 'white'
                    }}
                    value={perce}
                    radius={SizingUtils.mscale(40)}
                    renderText={() => {
                        return (
                                <Text
                                        variant={'big1'}
                                        color={'white'}
                                >{countdown}s</Text>
                        );
                    }}
            />
    );
}

function QrGen({ data }) {
    const params = new URLSearchParams(data);
    return (
            <QRCode
                    size={SizingUtils.mscale(180)}
                    value={`${ENV.APP_URL}?${params}`}
            />
    );
}


function ContrastButton(props) {
    return (
            <TouchableOpacity
                    style={{
                        ...props.style
                    }}
            >
                <Box
                        borderRadius={8}
                        backgroundColor={'appSuccess'}
                        p={'m'}
                        style={{
                            boxShadow: '#dddddd 0px 4px 3px'
                        }}
                        paddingHorizontal={'xl'}
                >
                    <Text
                            align={'center'}
                            bold
                            color={'white'}
                    >
                        {props.title}
                    </Text>
                </Box>
            </TouchableOpacity>
    );
}

function ReservationButton(props) {

    return (
            <TouchableOpacity
                    disabled={props.disabled}
                    style={{
                        ...props.style,
                        opacity: props?.disabled ? 0.5 : 1
                    }}
                    onPress={props.onPress}
            >
                <Box
                        borderRadius={BASE_RADIUS}
                        backgroundColor={'appSuccess'}
                        p={'l'}
                        style={{
                            boxShadow: '#dddddd 0px 4px 3px'
                        }}
                        paddingHorizontal={'xl'}
                >
                    <Text
                            align={'center'}
                            bold
                            variant={'heading4'}
                            color={'white'}
                    >
                        Reservar
                    </Text>
                </Box>
            </TouchableOpacity>
    );
}

function TabItem({ id, onPress, label, selected }) {
    return (
            <Box marginRight={'l'}>
                <TouchableOpacity
                        onPress={() => {
                            onPress(id);
                        }}
                >
                    <Box
                            borderBottomColor={'warningSecondary'}
                            paddingBottom={'s'}
                            borderBottomWidth={selected ? 3 : 0}
                    >
                        <Text
                                color={selected ? 'infoMain' : 'black'}
                                bold
                                variant={'heading1'}
                        >
                            {label}
                        </Text>
                    </Box>
                </TouchableOpacity>
            </Box>
    );
}

function RestaurantReservationSection() {
    return <Box></Box>;
}
