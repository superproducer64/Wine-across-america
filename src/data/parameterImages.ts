import { ImageSourcePropType } from 'react-native';

export const SPEC_CAROUSEL_PAGES: ImageSourcePropType[] = [
  require('../../assets/spec/spec_p8.png'),
  require('../../assets/spec/spec_p9.png'),
  require('../../assets/spec/spec_p10.png'),
  require('../../assets/spec/spec_p11.png'),
  require('../../assets/spec/spec_p12.png'),
  require('../../assets/spec/spec_p13.png'),
  require('../../assets/spec/spec_p14.png'),
];

export const PARAMETER_CAROUSEL_INDEX: Record<string, number> = {
  sweetness:        0,
  acidity:          0,
  tannin:           1,
  body:             1,
  alcohol:          2,
  intensity:        3,
  finish_length:    3,
  score_balance:    4,
  score_intensity:  4,
  score_complexity: 5,
  score_finish:     5,
  score_typicity:   6,
};

export const PARAMETER_IMAGES: Record<string, ImageSourcePropType> = {
  sweetness:        SPEC_CAROUSEL_PAGES[0],
  acidity:          SPEC_CAROUSEL_PAGES[0],
  tannin:           SPEC_CAROUSEL_PAGES[1],
  body:             SPEC_CAROUSEL_PAGES[1],
  alcohol:          SPEC_CAROUSEL_PAGES[2],
  intensity:        SPEC_CAROUSEL_PAGES[3],
  finish_length:    SPEC_CAROUSEL_PAGES[3],
  score_balance:    SPEC_CAROUSEL_PAGES[4],
  score_intensity:  SPEC_CAROUSEL_PAGES[4],
  score_complexity: SPEC_CAROUSEL_PAGES[5],
  score_finish:     SPEC_CAROUSEL_PAGES[5],
  score_typicity:   SPEC_CAROUSEL_PAGES[6],
};

export const PARAMETER_SCROLL_HINTS: Record<string, string> = {};
