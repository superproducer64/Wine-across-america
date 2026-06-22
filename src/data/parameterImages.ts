import { ImageSourcePropType } from 'react-native';

export const SPEC_CAROUSEL_PAGES: ImageSourcePropType[] = [
  require('../../assets/spec/spec_sweetness.png'),
  require('../../assets/spec/spec_acidity.png'),
  require('../../assets/spec/spec_tannin.png'),
  require('../../assets/spec/spec_body.png'),
  require('../../assets/spec/spec_alcohol.png'),
  require('../../assets/spec/spec_intensity.png'),
  require('../../assets/spec/spec_finish.png'),
  require('../../assets/spec/spec_balance.png'),
  require('../../assets/spec/spec_complexity.png'),
  require('../../assets/spec/spec_typicity.png'),
];

export const PARAMETER_CAROUSEL_INDEX: Record<string, number> = {
  sweetness:        0,
  acidity:          1,
  tannin:           2,
  body:             3,
  alcohol:          4,
  intensity:        5,
  finish_length:    6,
  score_balance:    7,
  score_intensity:  5,
  score_complexity: 8,
  score_finish:     6,
  score_typicity:   9,
};

export const PARAMETER_IMAGES: Record<string, ImageSourcePropType> = {
  sweetness:        SPEC_CAROUSEL_PAGES[0],
  acidity:          SPEC_CAROUSEL_PAGES[1],
  tannin:           SPEC_CAROUSEL_PAGES[2],
  body:             SPEC_CAROUSEL_PAGES[3],
  alcohol:          SPEC_CAROUSEL_PAGES[4],
  intensity:        SPEC_CAROUSEL_PAGES[5],
  finish_length:    SPEC_CAROUSEL_PAGES[6],
  score_balance:    SPEC_CAROUSEL_PAGES[7],
  score_intensity:  SPEC_CAROUSEL_PAGES[5],
  score_complexity: SPEC_CAROUSEL_PAGES[8],
  score_finish:     SPEC_CAROUSEL_PAGES[6],
  score_typicity:   SPEC_CAROUSEL_PAGES[9],
};

export const PARAMETER_SCROLL_HINTS: Record<string, string> = {};

export const PARAMETER_AUTO_SCROLL: Record<string, number> = {
  sweetness:        0,
  acidity:          0.5,
  tannin:           0,
  body:             0.5,
  alcohol:          0,
  intensity:        0,
  finish_length:    0.5,
  score_balance:    0,
  score_intensity:  0,
  score_complexity: 0,
  score_finish:     0.5,
  score_typicity:   0,
};
