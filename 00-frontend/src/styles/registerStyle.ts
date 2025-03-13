import { StyleSheet } from "react-native";

const RegisterStyle = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
  },
  topinfo: {
    width: 375,
    height: 812,
    display: "flex",
    alignItems: "center",
    marginTop: 125,
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: 20,
    width: '100%',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#D0D5DD',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    padding: 10,
    width: 310,
  },
  buttonUp: {
    backgroundColor: '#B7AEDF',
    borderRadius: 5,
    padding: 10,
    width: 350,
    alignItems: 'center',
    display: 'flex',
    marginBottom: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  text: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    lineHeight: 20,
    alignItems: 'flex-start'
  },
  textsignUp: {
    color: '#B7AEDF',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    lineHeight: 20,
    alignItems: 'flex-start'
  },
  frame: {
    borderWidth: 3,
    borderColor: '#FFB3C6',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    width: 300,
    height: 100,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 100
  },
  textframe: {
    display: "flex",
    alignItems: "flex-end",
    color: "#6ea9f7",
    fontFamily: 'Montserrat-Bold',
    fontSize: 32,
    lineHeight: 48,
  },
  texttitle: {
    marginLeft: 10,
    fontFamily: 'Montserrat-Regular',
    color: '#667085',
    fontSize: 14,
    lineHeight: 24,
    alignItems: 'flex-start'
  },
  inputframe: {
    width: 350,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row'
  },
  inputText: {
    alignItems: 'flex-start',
    padding: 10
  },
  showPasswordButton: {
    width: 25,
    height: 25,
  },
});

export default RegisterStyle;
