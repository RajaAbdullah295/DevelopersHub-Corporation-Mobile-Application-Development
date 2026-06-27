import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';

/**
 * Thin wrapper so screens import one local module instead of the
 * third-party package directly — keeps call sites short and makes a
 * future swap (e.g. to react-native-size-matters) a one-file change.
 *
 * Usage: rw(50) -> 50% of screen width, rf(2) -> responsive font size.
 */
export const rw = (percent) => responsiveWidth(percent);
export const rh = (percent) => responsiveHeight(percent);
export const rf = (size) => responsiveFontSize(size);

export default { rw, rh, rf };
