import Slider from 'react-slick';
import { Box } from '@main-components/Base/Box';
import { Icon } from '@main-components/Base/Icon';
import { useTheme } from '@shared/ui/theme/AppTheme';
import { Skeleton } from '@main-components/Base/Skeleton';
import RestaurantItem from '@modules/restaurants/ui/components/RestaurantItem';
import useNavigation from '@shared/domain/hooks/navigation/use-navigation';
import SizingUtils from '@utils/misc/sizing-utils';
import Text from '@main-components/Typography/Text';

export default function RestaurantsCarousel({ gap, title, restaurants, loading }) {

    const { navigate } = useNavigation();

    let settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 3,
        initialSlide: 0,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    infinite: false,
                    dots: true
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    };

    if (!loading && restaurants?.length == 0) {
        return (
                <Box>
                </Box>
        );
    }

    return (
            <Box
                    mb={gap}
                    width={'100%'}
            >
                {
                    loading ? (
                            <Slider {...settings}>
                                {[...new Array(5)].map(el => {
                                    return (
                                            <div>
                                                <Box marginHorizontal={'m'}>
                                                    <Skeleton
                                                            loading
                                                            type={'rectangle'}
                                                            height={'100%'}
                                                            style={{
                                                                borderRadius: 40,
                                                                aspectRatio: 1 / 1
                                                            }}
                                                    />
                                                </Box>
                                            </div>

                                    );
                                })}
                            </Slider>
                    ) : (
                            <Box>
                                <Title text={title} />
                                <Slider {...settings}>
                                    {
                                        restaurants?.map((item, index) => {
                                            return (
                                                    <div>
                                                        <RestaurantItem
                                                                item={item}
                                                                onPress={() => {
                                                                    navigate('restaurants/[id]', {
                                                                        id: item.id
                                                                    });
                                                                }}
                                                        />
                                                    </div>
                                            );
                                        })
                                    }
                                </Slider>
                            </Box>
                    )
                }

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


const HANDLE_SIZE = SizingUtils.scale(20);

function NextArrow(props) {
    const theme = useTheme();
    const { className, style, onClick } = props;
    return (
            <div
                    className={className}
                    style={{
                        ...style,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: HANDLE_SIZE,
                        height: HANDLE_SIZE,
                        borderRadius: HANDLE_SIZE / 2,
                        background: theme.colors.secondaryMain
                    }}
                    onClick={onClick}
            >
                <Icon
                        name={'chevron-right'}
                        color={'white'}
                        numberSize={HANDLE_SIZE / 2.5}
                />
            </div>
    );
}

function PrevArrow(props) {
    const theme = useTheme();
    const { className, style, onClick } = props;
    return (
            <div
                    className={className}
                    style={{
                        ...style,
                        display: 'flex',
                        zIndex: 9999,
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: HANDLE_SIZE,
                        height: HANDLE_SIZE,
                        borderRadius: HANDLE_SIZE / 2,
                        background: theme.colors.secondaryMain
                    }}
                    onClick={onClick}
            >
                <Icon
                        name={'chevron-left'}
                        color={'white'}
                        numberSize={HANDLE_SIZE / 2.5}
                />
            </div>
    );
}