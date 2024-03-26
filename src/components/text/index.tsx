import { FC, memo, PropsWithChildren } from 'react'

import * as S from './styles'

type Props = {
    value?: string
}
const Text: FC<PropsWithChildren<Props>> = memo(({ value, children }) => {
    return <S.TextContainer className="text">{value || children}</S.TextContainer>
})

export { Text }
