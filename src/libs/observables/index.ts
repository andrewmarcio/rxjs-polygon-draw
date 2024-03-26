import { Subject } from 'rxjs'

const StopDrawingObservable = new Subject<boolean>()

export { StopDrawingObservable }
