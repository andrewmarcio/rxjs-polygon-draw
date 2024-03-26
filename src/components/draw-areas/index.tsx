import { Text } from '@components'
import { memo } from 'react'

import * as S from './styles'
import { useDrawAreas } from './use-draw-areas'

const DrawAreas = memo(() => {
    const { canvasContainerRef, areas } = useDrawAreas()
    return (
        <S.DrawContainer>
            <S.ListAreasContent>
                <Text value="Áreas" />
                <S.AreasContainer>
                    {areas?.map(item => (
                        <Text>{JSON.stringify(item)}</Text>
                    ))}
                </S.AreasContainer>
            </S.ListAreasContent>
            <S.DrawCanvasContainer ref={canvasContainerRef} />
        </S.DrawContainer>
    )
})

export { DrawAreas }
