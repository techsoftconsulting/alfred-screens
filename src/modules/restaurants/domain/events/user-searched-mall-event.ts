import AppEvent from '@shared/domain/models/app-event';

export const USER_SEARCHED_MALL = 'USER_SEARCHED_MALL';

export default class UserSearchedMallEvent extends AppEvent {

    eventName(): string {
        return USER_SEARCHED_MALL;
    }

    get type(): string {
        return 'USER_ACTION';
    }

    toPrimitives() {
        return {
            ...this.props,
            type: this.type,
            name: this.eventName()
        };
    }

}