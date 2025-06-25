import {
  trigger,
  transition,
  style,
  animate,
  query,
  group
} from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  transition('* => SolicitarTurno', [
    query(':enter, :leave', style({ position: 'absolute', width: '100%' }), {
      optional: true
    }),
    query(':enter', style({ transform: 'scale(0.5)', opacity: 0 }), {
      optional: true
    }),
    group([
      query(
        ':leave',
        [animate('300ms ease-out', style({ opacity: 0 }))],
        { optional: true }
      ),
      query(
        ':enter',
        [animate('400ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))],
        { optional: true }
      )
    ])
  ]),
  transition('* <=> *', [
    query(':enter, :leave', style({ position: 'absolute', width: '100%' }), {
      optional: true
    }),

    query(':enter', style({ transform: 'translateY(100%)', opacity: 0 }), {
      optional: true
    }),
    group([
      query(
        ':leave',
        [animate('300ms ease-out', style({ transform: 'translateY(-40px)', opacity: 0 }))],
        { optional: true }
      ),
      query(
        ':enter',
        [animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))],
        { optional: true }
      )
    ])
  ])
]);