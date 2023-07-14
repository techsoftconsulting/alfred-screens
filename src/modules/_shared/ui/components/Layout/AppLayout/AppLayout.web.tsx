import { Box } from '@main-components/Base/Box';
import React, { useEffect, useState } from 'react';
import { Theme, useTheme } from '@modules/_shared/ui/theme/AppTheme';
import { useUpdateNavigationTitle } from '@shared/ui/navigation/useUpdateNavigationTitle';
import AppMenu, { APP_MENU_HEIGHT, SPACE_BAR_HEIGHT } from '@modules/restaurants/ui/components/AppMenu';
import { ProgressBar } from '@main-components/Base/ProgressBar';
import { IconButton } from '@main-components/Base/IconButton';
import { Modal, ModalProps } from '@main-components/Base/Modal';
import useNavigation from '@shared/domain/hooks/navigation/use-navigation';
import TouchableOpacity from '@main-components/Utilities/TouchableOpacity';
import Text from '@main-components/Typography/Text';
import RestaurantMall from '@modules/restaurants/domain/models/restaurant-mall';
import { usePathname } from 'expo-router';
import { Icon } from '@main-components/Base/Icon';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import useDimensions from '@utils/hooks/useDimensions';
import { Image } from '@main-components/Base/Image';
import { useSwipeable } from 'react-swipeable';
import SizingUtils from '@utils/misc/sizing-utils';

interface AppLayoutProps {
    children: JSX.Element;
    bg?: keyof Theme['colors'];
    title?: string;
    loading?: boolean;
    headerBgColor?: string;
    LoadingComponent?: JSX.Element;
}

const MIN_TRANS = 200;
const MAIN_MENU_WIDTH = SizingUtils.scale(50);

export default function AppLayout(props: AppLayoutProps) {
    const theme = useTheme();

    useUpdateNavigationTitle(props.title ?? '');
    const route = usePathname();
    const { navigate, goBack } = useNavigation();

    const items = ['/', '/categories', '/promotions'];
    const index = items.indexOf(route);

    const handlers = useSwipeable({
        onSwipedLeft: () => {
            if (index + 1 > items.length - 1) {
                navigate(items[0]);
                return;
            }
            navigate(items[index + 1]);
        },
        onSwipedRight: () => {
            if (index <= 0) {
                navigate(items[items.length - 1]);
                return;
            }
            navigate(items[index - 1]);
            return;

        },
        swipeDuration: 500,
        preventScrollOnSwipe: true,
        trackMouse: true
    });

    return (

            <Box
                    bg={'white'}
                    testID={'app-layout'}
                    style={{
                        overflow: 'auto',
                        /* maxWidth: 1024,
                         width: '100%',*/
                        /*alignSelf: 'center',*/
                        backgroundColor: props.bg ? theme.colors[props.bg] : theme.colors.white,
                        paddingBottom: 0 /* Trial bar */,
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1
                    }}
            >
                <TopArea {...props} />


                <BackButton />

                <div
                        style={{
                            marginTop: SPACE_BAR_HEIGHT + APP_MENU_HEIGHT / 2,
                            height: '100%'
                        }}
                >

                    <Box
                            flex={1}
                            height='100%'

                            p={'s'}
                            style={{
                                marginLeft: MAIN_MENU_WIDTH,
                                paddingTop: APP_MENU_HEIGHT,
                                marginRight: MAIN_MENU_WIDTH
                            }}
                            bg={props.bg ?? 'white'}
                    >

                        {props.children}

                    </Box>
                </div>

                {/*   <BottomIndicator
                        items={items}
                        selectedItem={route}
                />
*/}
            </Box>
    );
}

function TopArea(props) {
    return (
            <>
                <AppMenu />

                <Box
                        height={10}
                        width={'100%'}
                        zIndex={9999}

                        position={'fixed'}
                        style={{
                            top: APP_MENU_HEIGHT,
                            opacity: props.loading ? 1 : 0
                        }}
                >
                    <ProgressBar
                            borderRadius={0}
                            progress={100}
                            height={SizingUtils.vscale(3)}
                            color={'contrastMain'}
                            indeterminate
                    />
                </Box>

            </>
    );
}

const WAIT_TIME = 5000;

function BackButton() {
    const { navigate, goBack, canGoBack } = useNavigation();
    const ICON_SIZE = MAIN_MENU_WIDTH / 1.8;

    if (!canGoBack()) {
        return <Box></Box>;
    }

    return (
            <Box
                    position={'fixed'}
                    width={MAIN_MENU_WIDTH}
                    height={'100%'}
                    left={0}
                    top={APP_MENU_HEIGHT + SPACE_BAR_HEIGHT}
                    zIndex={9999}
                    /*  alignItems={'center'}*/
                    justifyContent={'center'}
            >
                {/*  <Box ml={'m'}>
                    <IconButton
                            containerSize={ICON_SIZE - 20}
                            borderRadius={ICON_SIZE - 20 / 2}
                            backgroundColor={'primaryMain'}
                            onPress={() => {
                                goBack();
                            }}
                            iconSize={ICON_SIZE / 2 - 10}
                            iconName={'arrow-left'}
                            iconColor={'white'}
                    />
                </Box>*/}
            </Box>
    );
}

function MainMenuController() {
    const [openMenu, setOpenMenu] = useState(false);

    useScrollHandler({
        onReached: () => {
            setOpenMenu(true);
        }
    });

    useEffect(() => {
        if (openMenu) {
            setTimeout(() => {
                setOpenMenu(false);
            }, WAIT_TIME);
        }
    }, [openMenu]);

    return (
            <>
                <AnimatedMenu open={openMenu} />
                <AnimatedCollapsedMenu
                        open={!openMenu}
                        onPress={() => {
                            setOpenMenu(true);
                        }}
                />
            </>
    );
}

function AnimatedMenu({ open }) {
    const dimensions = useDimensions();

    const desiredWidth = dimensions.width - MAIN_MENU_WIDTH;
    const randomWidth = useSharedValue(dimensions.width * 2);

    const animatedStyles = useAnimatedStyle(() => {
        return {
            height: '100%',
            width: MAIN_MENU_WIDTH,
            position: 'fixed',
            top: APP_MENU_HEIGHT + SPACE_BAR_HEIGHT,
            transform: [
                {
                    translateX: withSpring(randomWidth.value, {
                        damping: 10,
                        stiffness: 100,
                        overshootClamping: true
                    })
                }
            ]
        };
    });

    useEffect(() => {
        randomWidth.value = open ? desiredWidth : dimensions.width * 2;
    }, [open]);

    return (
            <Animated.View
                    style={[{
                        backgroundColor: 'white'
                    }, animatedStyles]}
            >
                <MainMenu />
            </Animated.View>
    );
}

function AnimatedCollapsedMenu({ open, onPress }) {
    const dimensions = useDimensions();

    const desiredWidth = dimensions.width - MAIN_MENU_WIDTH + 8;
    const randomWidth = useSharedValue(dimensions.width * 2);

    const animatedStyles = useAnimatedStyle(() => {
        return {
            height: '100%',
            top: APP_MENU_HEIGHT + SPACE_BAR_HEIGHT,
            width: MAIN_MENU_WIDTH,
            position: 'fixed',
            transform: [
                {
                    translateX: withSpring(randomWidth.value, {
                        damping: 10,
                        stiffness: 100,
                        overshootClamping: true
                    })
                }
            ]
        };
    });

    useEffect(() => {
        randomWidth.value = open ? desiredWidth : dimensions.width * 2;
    }, [open]);

    return (
            <Animated.View
                    style={[{
                        backgroundColor: 'white'
                    }, animatedStyles]}
            >
                <CollapsedMenu onPress={onPress} />
            </Animated.View>
    );
}

function CollapsedMenu({ onPress }) {
    const theme = useTheme();

    const COLLAPSED_MENU_SIZE = MAIN_MENU_WIDTH;

    return (
            <Box
                    alignItems={'center'}
                    justifyContent={'center'}
                    position={'fixed'}
                    height={'100%'}
                    bg={'white'}
                    right={0}
                    width={MAIN_MENU_WIDTH}
            >
                <Box>
                    <TouchableOpacity onPress={onPress}>
                        <Box
                                height={COLLAPSED_MENU_SIZE}
                                width={COLLAPSED_MENU_SIZE}
                                right={-COLLAPSED_MENU_SIZE / 2}
                                borderTopLeftRadius={COLLAPSED_MENU_SIZE / 2}
                                borderBottomLeftRadius={COLLAPSED_MENU_SIZE / 2}
                                style={{
                                    paddingLeft: COLLAPSED_MENU_SIZE / 6,
                                    backgroundImage: `linear-gradient(${theme.colors.contrastLight}, ${theme.colors.contrastMain}) `
                                }}
                                justifyContent={'center'}
                        >

                            <Icon
                                    numberSize={SizingUtils.mscale(30)}
                                    color={'white'}
                                    name={'chevron-left'}
                            />

                        </Box>
                    </TouchableOpacity>
                </Box>
            </Box>
    );
}

function useScrollHandler({ onReached }) {
    const scrollThreshold = 500; // Change this value as per your requirement

    useEffect(() => {
        function checkScrollDistance() {
            if (window.scrollY >= scrollThreshold) {
                onReached();
            }
        }

        setTimeout(() => {
            window.addEventListener('scroll', checkScrollDistance);
        }, 2000);

        // Clean up the event listener on component unmount
        return () => {
            window.removeEventListener('scroll', checkScrollDistance);
        };
    }, []);

}

function BottomIndicator({ selectedItem, items }) {

    const INDICATOR_WIDTH = SizingUtils.mscale(200);
    const DOT_WIDTH = SizingUtils.mscale(15);

    return (
            <Box
                    position={'fixed'}
                    width={INDICATOR_WIDTH}
                    borderRadius={80}
                    bg={'white'}
                    paddingVertical={'s'}
                    justifyContent={'center'}
                    alignSelf={'center'}
                    bottom={SizingUtils.vscale(15)}
                    flexDirection={'row'}
                    gap={'m'}
                    style={{
                        left: `calc(50% -  ${INDICATOR_WIDTH / 2}px )`
                    }}
                    alignItems={'center'}
            >
                {
                    items?.map(el => {
                        const isSelected = el == selectedItem;

                        return (
                                <Box
                                        width={isSelected ? DOT_WIDTH + 30 : DOT_WIDTH}
                                        height={isSelected ? DOT_WIDTH + 30 : DOT_WIDTH}
                                        borderRadius={isSelected ? DOT_WIDTH + 30 / 2 : DOT_WIDTH / 2}
                                        bg={isSelected ? 'greyMain' : 'greyMedium'}
                                />
                        );
                    })
                }
            </Box>
    );
}


function MainMenu() {
    const theme = useTheme();
    const [showMenuModal, setShowMenuModal] = useState(false);
    const { navigate } = useNavigation();

    const ICON_SIZE = SizingUtils.mscale(30);

    return (
            <Box
                    width={MAIN_MENU_WIDTH}
                    position={'fixed'}
                    height={'100%'}
                    right={0}
                    style={{
                        backgroundImage: `linear-gradient(${theme.colors.contrastMain},${theme.colors.contrastLight}) `
                    }}
                    alignItems={'center'}
                    justifyContent={'center'}
            >
                <Box gap={'xl'}>
                    <IconButton
                            iconName={'home'}
                            iconType={'feather'}
                            iconColor={'white'}
                            iconSize={ICON_SIZE}
                            onPress={() => {
                                navigate('/');
                            }}
                    />


                </Box>


                <MallMenu
                        mall={mall}
                        onDismiss={() => {
                            setShowMenuModal(false);
                        }}
                        visible={showMenuModal}
                />
            </Box>
    );
}


function MallMenu(props: Partial<ModalProps> & { mall?: RestaurantMall }) {
    const theme = useTheme();
    const { navigate } = useNavigation();
    const MODAL_HEIGHT = SizingUtils.vscale(180);

    return (
            <Modal
                    containerStyle={{}}
                    contentContainerStyle={{
                        backgroundColor: theme.colors.primaryMain,
                        top: `calc(50% - ${MODAL_HEIGHT / 2}px)`,
                        maxWidth: '70%',
                        height: MODAL_HEIGHT
                    }}
                    visible={props.visible}
                    onDismiss={props.onDismiss}
            >
                <Box
                        alignSelf={'center'}
                >
                    <Box
                            mb={'m'}
                            alignItems={'center'}
                    >
                        <Image
                                style={{
                                    width: SizingUtils.mscale(80),
                                    aspectRatio: 1 / 1
                                }}
                                source={{
                                    uri: props?.mall?.logoUrl
                                }}
                        />
                    </Box>
                    <Box mb={'xl'}>
                        <Text
                                variant={'heading2'}
                                align={'center'}
                                color={'white'}
                                bold
                        >Plaza {props?.mall?.name}</Text>
                    </Box>
                    <Box
                            flexDirection={'column'}
                            gap={'l'}
                    >
                        <MallMenuItem
                                label={'Reservar en cualquier restaurante'}
                                onPress={() => {
                                    props.onDismiss?.();
                                    navigate('/');
                                }}
                        />
                        <MallMenuItem
                                label={'Promociones ' + props?.mall?.name}
                                onPress={() => {
                                    props.onDismiss?.();
                                    navigate('/promotions', {
                                        mall: 'current'
                                    });
                                }}
                        />
                        <MallMenuItem
                                label={'Menú principal'}
                                onPress={() => {
                                    props.onDismiss?.();
                                }}
                        />
                    </Box>

                </Box>

            </Modal>
    );
}

function MallMenuItem({ label, onPress }) {
    return (
            <TouchableOpacity onPress={onPress}>
                <Box
                        p={'m'}
                        bg={'white'}
                        borderRadius={40}
                >
                    <Text
                            align={'center'}
                            style={{
                                color: '#A77E1C'
                            }}
                    >{label}</Text>
                </Box>
            </TouchableOpacity>
    );
}
