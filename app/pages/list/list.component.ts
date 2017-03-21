import { Component, ElementRef, NgZone, OnInit, ViewChild } from "@angular/core";
import { Grocery } from "../../shared/grocery/grocery";
import { GroceryListService } from "../../shared/grocery/grocery-list.service";

import { TextField } from "ui/text-field";
import * as SocialShare from "nativescript-social-share";

@Component({
    selector: "list",
    templateUrl: "pages/list/list.html",
    providers: [GroceryListService],
    styleUrls: ["pages/list/list-common.css", "pages/list/list.css"]
})
export class ListComponent implements OnInit {
    groceryList: Array<Grocery> = [];

    grocery = "";

    //usado no ActivityIndicator
    isLoading = false;

    listLoaded = false;

    //utilizado para receber o elemento do html. Similar ao getElementById
    @ViewChild("groceryTextField") groceryTextField: ElementRef;

    constructor(private zone: NgZone, private groceryListService: GroceryListService) { }

    ngOnInit() {
        this.isLoading = true;
        this.groceryListService.load()
            .subscribe(loadedGroceries => {
                loadedGroceries.forEach((groceryObject) => {
                    this.groceryList.unshift(groceryObject);
                });
                this.isLoading = false;
                this.listLoaded = true;
            });
    }

    add() {
        if (this.grocery.trim() === "") {
            alert("Enter a grocery item");
            return;
        }

        // Dismiss the keyboard através do id (variável criada logo acima com o @ViewChield)
        let textField = <TextField>this.groceryTextField.nativeElement;
        textField.dismissSoftInput();

        this.groceryListService.add(this.grocery)
            .subscribe(
            groceryObject => {
                this.groceryList.unshift(groceryObject);
                this.grocery = "";
            },
            () => {
                alert({
                    message: "An error occurred while adding an item to your list.",
                    okButtonText: "OK"
                });
                this.grocery = "";
            }
            )
    }

    delete(grocery: Grocery) {
        this.groceryListService.delete(grocery.id)
            .subscribe(() => {
                // Running the array splice in a zone ensures that change detection gets triggered.
                this.zone.run(() => {
                    let index = this.groceryList.indexOf(grocery);
                    this.groceryList.splice(index, 1);
                });
            });
    }

    share() {
        let list = [];
        for (let i = 0, size = this.groceryList.length; i < size; i++) {
            list.push(this.groceryList[i].name);
        }
        let listString = list.join(", ").trim();
        SocialShare.shareText(listString);
    }
}