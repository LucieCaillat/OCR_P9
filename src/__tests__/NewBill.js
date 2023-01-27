/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from '../app/Router';
import { ROUTES, ROUTES_PATH } from '../constants/routes';


describe("Unit test", () => {

  describe("When the function handleChangeFile() of class NewBill is used", () => {

    describe("when I upload a file with the wrong format", () => {

      test("then it should return an error message ", () => {
        const wrongFormatFile = new File(["hello"], "hello.txt", { type: "document/txt" })
        const documentMock = {
          querySelector: (s) => {
            if (s === 'input[data-testid="file"]') {
              return {
                files: [wrongFormatFile],
                addEventListener: () => true,
              }
            } else {
              return { addEventListener: () => true }
            }
          },
        }        
        const objInstance = new NewBill({
          document: documentMock,
          onNavigate: {},
          store: {},            
          localStorage: {}
        });
        const mockAlert = jest.fn()
        global.alert = mockAlert
        objInstance.handleChangeFile({ preventDefault: () => true })
        expect(mockAlert.mock.calls).toHaveLength(1)
      })
    });

    describe("when I upload a file with the good format", () => {

      test("then it should save the user's email", () => {

        localStorage.setItem("user", '{"email" : "user@email.com"}')
        const createMock = jest.fn()
        const goodFormatFile = new File(['img'], 'image.png', { type: 'image/png' })
        const documentMock ={
          querySelector: (s) => {
            if (s === 'input[data-testid="file"]') {
              return {
                files: [goodFormatFile],
                addEventListener: () => true,
              };
            } else {
              return { addEventListener: () => true }
            }
          },
        }
        const storeMock ={
          bills: () => {
            return {
              create: createMock.mockResolvedValue({fileUrl: "fileURL", key: "key"}) 
            }
          }
        }
        const objInstance = new NewBill({
          document: documentMock,
          onNavigate: {},
          store: storeMock,
          localStorage: {}
        });

        objInstance.handleChangeFile({ 
          preventDefault: () => true ,
          target: {value: ""}
        })
        expect(createMock.mock.calls[0][0].data.get("email")).toEqual("user@email.com")
      })
    })   
  })
})
