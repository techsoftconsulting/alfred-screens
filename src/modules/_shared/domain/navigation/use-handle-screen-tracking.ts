import useEventBus from '@shared/domain/hooks/use-event-bus';
import { useEffect, useMemo, useRef } from 'react';
import { usePathname, useSearchParams, useSegments } from 'expo-router';

export function useHandleScreenTracking({ isReady }) {
    const eventBus = useEventBus();
    const routeNameRef: any = useRef();

    const pathname = usePathname();
    const screenParams = useSearchParams();
    const segments = useSegments();

    const segmentUrl = useMemo(() => {
        const validSegments = segments?.filter(s => s.indexOf('(') === -1);
        if (validSegments.length == 0) return '/';
        return validSegments.join('/');
    }, [segments]);

    const screensToTrack: any = {
        'restaurants/[id]': 'restaurants'
    };


    function publishEvent(screenData: any) {
        /* eventBus.publish(

         );*/
    }

    function setCurrentScreen(screen: string) {
        routeNameRef.current = screen;
    }

    function shouldTrackScreen({
        prevScreen,
        currentScreen
    }: { prevScreen: string, currentScreen: string }) {

        if (prevScreen == currentScreen) return false;
        if (!isReady) return false;
        if (!Object.keys(screensToTrack).includes(currentScreen)) return false;
        return true;
    }

    function onScreenChange() {

        const previousRouteName = routeNameRef.current as string;
        const currentRouteName = segmentUrl as string;
        const params = screenParams;

        setCurrentScreen(currentRouteName);
        const currentRouteSlug = screensToTrack[currentRouteName];


        if (!shouldTrackScreen({
            prevScreen: previousRouteName,
            currentScreen: currentRouteName
        })) {
            return;
        }

        const screenData = {
            params: params ?? {}
        };

        publishEvent(screenData);
    }

    useEffect(() => {
        onScreenChange();
    }, [pathname, screenParams, segmentUrl]);

}