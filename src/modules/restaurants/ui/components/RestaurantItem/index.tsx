import { Box } from '@main-components/Base/Box';
import TouchableOpacity from '@main-components/Utilities/TouchableOpacity';
import { Image } from '@main-components/Base/Image';
import SizingUtils from '@utils/misc/sizing-utils';
import { RESTAURANT_GRID_ITEM_SIZE } from '@modules/restaurants/ui/constants';

export default function RestaurantItem({ item, onPress }) {

    return (
            <Box
                    width={RESTAURANT_GRID_ITEM_SIZE}
                    height={RESTAURANT_GRID_ITEM_SIZE}
                    borderRadius={20}
                    marginHorizontal={'m'}
            >
                <TouchableOpacity
                        onPress={onPress}
                >
                    <Image
                            resizeMode={'cover'}
                            style={{
                                borderRadius: SizingUtils.mscale(20),
                                aspectRatio: 1 / 1
                            }}
                            source={{
                                uri: item?.logoUrl
                            }}
                    />
                </TouchableOpacity>
            </Box>
    );
}