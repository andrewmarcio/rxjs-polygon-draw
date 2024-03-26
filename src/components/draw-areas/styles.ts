import styled from 'styled-components'

const DrawContainer = styled.section`
    display: flex;
    flex: 1;
    max-height: 70dvh;
    padding: 1rem;
    flex-direction: row;
    gap: 1rem;
    justify-content: space-around;
`

const ListAreasContent = styled.div`
    display: grid;
    flex: 1;
    grid-template-rows: max-content;
    min-width: 6.25rem;
    max-width: 18.75rem;
    background-color: #fff;

    gap: 1rem;

    padding: 0.5rem;
    border-radius: 0.5rem;
`

const AreasContainer = styled.div`
    height: 100%;
    width: 100%;
    overflow: hidden auto;
`

const DrawCanvasContainer = styled.canvas`
    display: flex;
    width: 70dvw;
    height: 70dvh;
    border-radius: 0.5rem;
    background-color: #fff;
`

export { AreasContainer, DrawCanvasContainer, DrawContainer, ListAreasContent }
