/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";

describe("unit tests",() =>{
  describe("When the function getBills() of class Bills is used", () => {
    test("Then bills on the store should be ordered from earliest to latest", () => {
      
      const billsSorted = [...bills].sort((a, b) => {
        return new Date(a.date) < new Date(b.date) ? 1 : -1;
      });
      
      const storeMock = {
        bills: () => {
          return {
            list: () => {
              return {
                then: (fn) => fn(bills),
              };
            },
          };
        }
      };
      const billsObject = new Bills({
        document,
        onNavigate: {}, 
        store : storeMock,
        localStorage : {}
      })
      const testBillsSorted = billsObject.getBills();

      expect(testBillsSorted.map(bill => bill.id)).toEqual(billsSorted.map(bill => bill.id));      
    })

    test("If corrupted data was introduced, then return unformatted date", () => {
      
      const corruptedBills = [{
        "status": "refused",
        "date": "unformatted date"
      }];      
      
      const storeMock = {
        bills: () => {
          return {
            list: () => {
              return {
                then: (fn) => fn(corruptedBills),
              };
            },
          };
        }
      };

      const billsObject = new Bills({
        document,
        onNavigate: {}, 
        store: storeMock,
        localStorage: {}
      })
      const testBillsError = billsObject.getBills();
      const expectedBillsError = [ { status: 'Refusé', date: 'unformatted date' } ];
      
      expect(testBillsError).toEqual( expectedBillsError);
    })
  })

  describe("When the function handleClickIconEye() of class Bills is used", () => {
    test("Then it should open modal", () => {
      const modal = document.createElement("div");
      modal.setAttribute("id", "modaleFile");
      const modalContent = document.createElement("div");
      modalContent.setAttribute("class", "modal-body");
      modal.append(modalContent);
      document.body.append(modal);

      const mockFn = jest.fn((arg) => true);
      global.$.fn.modal = mockFn;

      const documentMock = {
        querySelector: () => null,
        querySelectorAll: () => null,
      }
      const storeMock = {
        bills: () => {
          return {
            list: () => {
              return {
                then: (fn) => fn(bills),
              };
            },
          };
        },
      }

      const billsObject = new Bills({
        document: documentMock,
        onNavigate: {},
        store: storeMock,
        localStorage: {},
      });
      billsObject.handleClickIconEye({ getAttribute: () => "fakeUrl" });
      expect(mockFn.mock.calls).toHaveLength(1);
    });
  })
})


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')      
      expect(windowIcon.className).toBe('active-icon')      
    })
    
    test('When it is loading, then it should be display Loading... ', () => {
      const html = BillsUI({ loading: true });
      document.body.innerHTML = html;
      expect(screen.getByText('Loading...')).toBeTruthy();
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })    
  })
});
