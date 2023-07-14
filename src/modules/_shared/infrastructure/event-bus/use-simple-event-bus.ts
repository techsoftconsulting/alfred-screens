import React from 'react';
import AppEvent from '@shared/domain/models/app-event';
import ApiAnalyticsRepository from '@modules/restaurants/infrastructure/repositories/api-analytics-repository';
import UserVisitedRestaurantEvent, { USER_VISITED_RESTAURANT } from '@modules/restaurants/domain/events/user-visited-restaurant-event';
import UserVisitedMallEvent, { USER_VISITED_MALL } from '@modules/restaurants/domain/events/user-visited-mall-event';
import UserSearchedRestaurantEvent, { USER_SEARCHED_RESTAURANT } from '@modules/restaurants/domain/events/user-searched-restaurant-event';
import UserBookedRestaurantTableEvent, { USER_BOOKED_RESTAURANT_TABLE } from '@modules/restaurants/domain/events/user-booked-restaurant-table-event';
import UserVisitedPromotionEvent, { USER_VISITED_PROMOTION } from '@modules/restaurants/domain/events/user-visited-promotion-event';
import UserSearchedMallEvent, { USER_SEARCHED_MALL } from '@modules/restaurants/domain/events/user-searched-mall-event';
import useFindConfigurations from '@modules/restaurants/application/config/use-find-configurations';
import ObjectUtils from '@utils/misc/object-utils';

type HandlerParams = {}

const eventHandlers = {
    [USER_VISITED_RESTAURANT]: (event: UserVisitedRestaurantEvent, params: HandlerParams) => {
        storeEvent(event, params);
    },
    [USER_VISITED_MALL]: (event: UserVisitedMallEvent, params: HandlerParams) => {
        storeEvent(event, params);
    },
    [USER_SEARCHED_RESTAURANT]: (event: UserSearchedRestaurantEvent, params: HandlerParams) => {
        storeEvent(event, params);
    },
    [USER_BOOKED_RESTAURANT_TABLE]: (event: UserBookedRestaurantTableEvent, params: HandlerParams) => {
        storeEvent(event, params);
    },
    [USER_VISITED_PROMOTION]: (event: UserVisitedPromotionEvent, params: HandlerParams) => {
        storeEvent(event, params);
    },
    [USER_SEARCHED_MALL]: (event: UserSearchedMallEvent, params: HandlerParams) => {
        storeEvent(event, params);
    }
};

function storeEvent(event: AppEvent, params: HandlerParams) {
    const repo = new ApiAnalyticsRepository({});

    /*   if (__DEV__) {
           console.log(`New ${event.eventName()}`);
           return;
       }*/
    /*  console.log(`New ${event.eventName()}`);
      return;*/


    try {
        event.updateData(ObjectUtils.omitUnknown({
            ...event.data,
            ...params,
        }));
        repo.save(event);
    } catch (e) {

    }
}

export default function useSimpleEventBus() {
    const { loading, data: config } = useFindConfigurations();

    const [state, dispatch] = React.useReducer(
        (prevState: any, event: AppEvent) => {
            if (!config) return { ...prevState };
            // @ts-ignore
            const handler = !config?.mallId ? null : eventHandlers[event.eventName()];

            if (!handler) return { ...prevState };

            handler?.(event, {
                mallId: config.mallId
            });

            return { ...prevState };
        },
        {}
    );

    return {
        state,
        publish: dispatch
    };
}