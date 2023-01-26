/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js";


describe("Given I am connected as an employee", () => {

  describe("When I am on NewBill Page", () => {

    describe("when I upload a file with the wrong format", () => {

      test("then the function handleChangeFile should return an error message ", () => {
        const objInstance = new NewBill(
          {
            document: {
              querySelector: (s) => {
                if (s === 'input[data-testid="file"]') {
                  return {
                    files: [
                      new File(["hello"], "hello.txt", { type: "document/txt" }),
                    ],
                    addEventListener: () => true,
                  };
                } else {
                  return { addEventListener: () => true };
                }
              },
            },

          onNavigate: {},

          store: {},
            
          localStorage
          }
        );
        const mockAlert = jest.fn();
        global.alert = mockAlert;
        objInstance.handleChangeFile({ preventDefault: () => true });
        expect(mockAlert.mock.calls).toHaveLength(1);
      })
    });

    describe("when I upload a file with the good format", () => {

      test("then the function handleChangeFile should save the user's email", () => {

        localStorage.setItem("user", '{"email" : "user@email.com"}')
        const createMock = jest.fn()

        const objInstance = new NewBill(
          {
            document: {
              querySelector: (s) => {
                if (s === 'input[data-testid="file"]') {
                  return {
                    files: [
                      new File(['img'], 'image.png', { type: 'image/png' }),
                    ],
                    addEventListener: () => true,
                  };
                } else {
                  return { addEventListener: () => true };
                }
              },
            },

            onNavigate: {},

            store: {
              bills: () => {
                return {
                  create: createMock.mockResolvedValue({fileUrl: "fileURL", key: "key"}) 
                }
              }
            },

            localStorage
          },
          );

        objInstance.handleChangeFile({ 
          preventDefault: () => true ,
          target: {value: ""}
        })
        expect(createMock.mock.calls[0][0].data.get("email")).toEqual("user@email.com")
      })
    });   
  })
})
