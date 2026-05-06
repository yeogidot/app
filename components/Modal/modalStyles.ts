import { StyleSheet } from 'react-native';

export const modalStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  modal: {
    borderRadius: 5,
    backgroundColor: '#ffffff',
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 20,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 5,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Noto Sans KR',
    fontWeight: '700',
    margin: 0,
  },
  message: {
    fontSize: 16,
    fontFamily: 'Noto Sans KR',
    fontWeight: '400',
    color: '#000000',
    lineHeight: 22,
    marginVertical: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    minWidth: 59,
    height: 32,
    borderRadius: 5,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Noto Sans KR',
    fontWeight: '700',
    color: '#fff',
  },
  blue: {
    backgroundColor: '#0d9eff',
  },
  red: {
    backgroundColor: '#f62424',
  },
  gray: {
    backgroundColor: '#757575',
  },
  blueText: {
    color: '#fff',
  },
  redText: {
    color: '#fff',
  },
  grayText: {
    color: '#fff',
  },
});
