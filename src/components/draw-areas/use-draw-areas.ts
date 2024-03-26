import { StopDrawingObservable } from '@observables'
import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { fromEvent, merge, pairwise, switchMap, takeUntil, tap } from 'rxjs'
import { TCanvasConvertDimensionsRef, TCanvasOffsetRef } from 'types/canvas'
import { IPolygon } from 'types/polygon'

import { areasReducer } from './reducer/areas-reducer'

function useDrawAreas() {
    const canvasContainerRef = useRef<HTMLCanvasElement>(null)
    const canvasContextRef = useRef<CanvasRenderingContext2D>()

    const canvasOffsetRef = useRef<TCanvasOffsetRef>({
        x: null,
        y: null,
    })
    const drawStartRef = useRef<TCanvasOffsetRef>({
        x: null,
        y: null,
    })

    const dimensionValueRef = useRef<TCanvasConvertDimensionsRef>({
        total: 1920,
        actually: null,
    })

    const [areas, dispatch] = useReducer(areasReducer, [])
    // const [areas, setAreas] = useState<IPolygon[]>([])

    const _setPolygonArea = useCallback((area: IPolygon) => {
        const { width, height } = area
        if (!width || !height) return

        dispatch({
            payload: area,
            type: 'SET',
        })
        // setAreas(state => [...state, area])
    }, [])

    const _canvasDrawStroke = useCallback(({ rectH, rectW }: { rectW: number; rectH: number }) => {
        canvasContextRef.current!.strokeStyle = '#000000'
        canvasContextRef.current!.clearRect(
            0,
            0,
            canvasContainerRef.current!.width,
            canvasContainerRef.current!.height,
        )

        canvasContextRef.current!.strokeRect(drawStartRef.current.x!, drawStartRef.current.y!, rectW, rectH)
    }, [])

    const _getRectDimensions = useCallback((event: MouseEvent) => {
        const mouseX = event.clientX - canvasOffsetRef.current.x!
        const mouseY = event.clientY - canvasOffsetRef.current.y!

        const rectW = mouseX - drawStartRef.current.x!
        const rectH = mouseY - drawStartRef.current.y!
        return { rectW, rectH }
    }, [])

    const _drawWhenMouseMove = useCallback(
        (event: [Event, Event]) => {
            const [_, currentMoveEvent] = event
            const currentEvent = currentMoveEvent as MouseEvent
            const { rectH, rectW } = _getRectDimensions(currentEvent)
            _canvasDrawStroke({ rectH, rectW })
        },
        [_getRectDimensions, _canvasDrawStroke],
    )

    const _startDrawing = useCallback((mouseDownEvent: Event) => {
        const mouseDown = mouseDownEvent as MouseEvent

        const { x, y } = drawStartRef.current
        if (![x, y].includes(null)) return

        drawStartRef.current = {
            x: mouseDown.clientX - canvasOffsetRef.current.x!,
            y: mouseDown.clientY - canvasOffsetRef.current.y!,
        }
    }, [])

    const _stopDrawing = useCallback(
        (moveEvent: Event) => {
            const currentEvent = moveEvent as MouseEvent

            const { rectW, rectH } = _getRectDimensions(currentEvent)

            const dimensionConvert = (value: number, dimension: 'width' | 'height') =>
                Math.round(
                    (Math.round(value) * dimensionValueRef.current.total) /
                        canvasContainerRef.current![dimension],
                )

            _setPolygonArea({
                x: dimensionConvert(
                    rectW < 0 ? drawStartRef.current.x! - Math.abs(rectW) : drawStartRef.current.x!,
                    'width',
                ),
                y: dimensionConvert(
                    rectH < 0 ? drawStartRef.current.y! - Math.abs(rectH) : drawStartRef.current.y!,
                    'height',
                ),
                width: dimensionConvert(rectW < 0 ? Math.abs(rectW) : rectW, 'width'),
                height: dimensionConvert(rectH < 0 ? Math.abs(rectH) : rectH, 'height'),
            })

            drawStartRef.current = {
                x: null,
                y: null,
            }
        },
        [_setPolygonArea, _getRectDimensions],
    )

    const _drawStrokePolygon = useCallback(
        ({
            x,
            y,
            color,
            height,
            width,
        }: {
            x: number
            y: number
            width: number
            height: number
            color: string
        }) => {
            canvasContextRef.current!.fillStyle = color
            canvasContextRef.current!.strokeStyle = color

            // border polygon
            canvasContextRef.current!.strokeRect(x, y, width, height)
        },
        [],
    )

    const _drawFillPolygon = useCallback(
        ({
            color,
            height,
            width,
            x,
            y,
            opacity,
        }: {
            x: number
            y: number
            width: number
            height: number
            color: string
            opacity?: number
        }) => {
            canvasContextRef.current!.fillStyle = color
            canvasContextRef.current!.strokeStyle = color

            // background polygon
            canvasContextRef.current!.globalAlpha = opacity ?? 0.4
            canvasContextRef.current!.fillRect(x, y, width, height)
            canvasContextRef.current!.globalAlpha = 1
        },
        [],
    )

    const _drawPoints = useCallback(
        (areas: IPolygon[]) => {
            canvasContextRef.current!.clearRect(
                0,
                0,
                canvasContainerRef.current!.width,
                canvasContainerRef.current!.height,
            )

            const colors = ['#718093', '#192a56']
            areas?.forEach((item, key) => {
                // border polygon
                const color = colors[Number(!!(key % 2))]
                _drawStrokePolygon({
                    x: item.x * dimensionValueRef.current.actually!.x,
                    y: item.y * dimensionValueRef.current.actually!.y,
                    width: item.width * dimensionValueRef.current.actually!.x!,
                    height: item.height * dimensionValueRef.current.actually!.y,
                    color,
                })

                _drawFillPolygon({
                    x: item.x * dimensionValueRef.current.actually!.x,
                    y: item.y * dimensionValueRef.current.actually!.y,
                    width: item.width * dimensionValueRef.current.actually!.x!,
                    height: item.height * dimensionValueRef.current.actually!.y,
                    color,
                    opacity: 0.4,
                })
            })
        },
        [_drawStrokePolygon, _drawFillPolygon],
    )

    const _canvasCaptureEvents = useCallback(
        (canvasElement: HTMLCanvasElement) => {
            return fromEvent(canvasElement, 'mousedown')
                .pipe(
                    tap(_startDrawing),
                    switchMap((_: Event) =>
                        fromEvent(canvasElement, 'mousemove').pipe(
                            takeUntil(
                                merge(
                                    fromEvent(canvasElement, 'mouseup'),
                                    fromEvent(canvasElement, 'mouseleave'),
                                ).pipe(
                                    tap((mergeMouseEvent: Event) => {
                                        _stopDrawing(mergeMouseEvent)
                                        StopDrawingObservable.next(true)
                                    }),
                                ),
                            ),
                            takeUntil(StopDrawingObservable),
                        ),
                    ),
                    pairwise(),
                )
                .subscribe(_drawWhenMouseMove)
        },
        [_drawWhenMouseMove, _startDrawing, _stopDrawing],
    )

    const _initCanvas = useCallback(() => {
        if (!canvasContainerRef.current) return

        const canvasEle = canvasContainerRef.current
        canvasEle.width = canvasEle.clientWidth
        canvasEle.height = canvasEle.clientHeight

        dimensionValueRef.current.actually = {
            x: (canvasEle.width * 100) / dimensionValueRef.current.total / 100,
            y: (canvasEle.height * 100) / dimensionValueRef.current.total / 100,
        }

        const context = canvasEle.getContext('2d') as CanvasRenderingContext2D
        context.lineCap = 'round'
        context.strokeStyle = '#000000'
        context.lineWidth = 1
        canvasContextRef.current = context

        const canvasOffset = canvasEle.getBoundingClientRect()
        canvasOffsetRef.current = { x: canvasOffset.left, y: canvasOffset.top }

        const eventsObservable = _canvasCaptureEvents(canvasEle)
        return {
            unsubscribe: eventsObservable?.unsubscribe,
        }
    }, [_canvasCaptureEvents])

    useEffect(() => {
        if (areas.length > 0) {
            _drawPoints(areas)
        }
    }, [areas, _drawPoints])

    useEffect(() => {
        const canvas = _initCanvas()

        return () => {
            console.log('unsubscribed')
            canvas?.unsubscribe()
        }
    }, [_initCanvas])

    return {
        areas,
        canvasContainerRef,
    }
}

export { useDrawAreas }
