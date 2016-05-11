// code copied from foodform to avoid tinkering with addfood.html

if (Meteor.isClient) {
    Template.editform.events({
        'submit form': function (event, template) {
            // Prevent default browser form submit
            event.preventDefault();

            var file_id = 0;

            //console.log("editform submit");
            // Get values from form element
            const target = event.target;
            const Name = target.name.value;
            const energy = target.energy.value;
            const carbs = target.carbs.value;
            const sugar = target.sugar.value;
            const fat = target.fat.value;
            const salt = target.salt.value;
            const prot = target.prot.value;
            const fiber = target.fiber.value;
            const category = target.category.value;
            const manufacturer = target.manufacturer.value;
            const barcode = target.barcode.value;
            var removeImage = Session.get('fileRemoveCB'); // true / false
            var theDoc = Session.get('theDoc');

// Does an item with same name and manufacturer already exist in mongoDB that's NOT the item being edited?
            var foodExists = Foods.find({name: {$regex: "^" + Name + "$", $options: "i"}, 
                valmistaja:{$regex: "^" + manufacturer + "$", $options: "i"}},  
                { _id:1, name: 1, viivakoodi: 1, valmistaja:1} );
            foundFoodName = foodExists.map( function(x) {return x.name;}); // console.log(foundFoodName);
            foundFoodManuf = foodExists.map( function(x) {return x.valmistaja;}); // console.log(foundFoodManuf);
            foundFoodId = foodExists.map( function(x) {return x._id;}); // console.log(foundFoodId);
// name, manufacturer, & id, should only have 1 hit, but let's double check
            var nameAndM_match = false;
            for (var i in foundFoodName, foundFoodManuf) {
                if ( (foundFoodName[i].toLowerCase() === Name.toLowerCase() ) 
                    && (foundFoodManuf[i].toLowerCase() === manufacturer.toLowerCase())
                    && JSON.stringify(foundFoodId[i]) !== JSON.stringify(theDoc._id) ) { // cmdline inserted have _id: Object{_str: ""}
                    nameAndM_match = true;
                    if(manufacturer !== '') var msg = foundFoodName[i] + " löytyy jo tietokannasta valmistajalta " + foundFoodManuf[i];
                    else var msg = Name + " löytyy jo tietokannasta";
                    alert(msg);
                    return false; 
                }
            }
            // barcode, ignore name and manufacturer, but include  them in the result
            var barcodeExists = Foods.find({viivakoodi: barcode},  {
                _id:1, name: 1, viivakoodi: 1, valmistaja:1} );
            foundBarcode = barcodeExists.map( function(x) {return x.viivakoodi;});
            foundFoodId2 = barcodeExists.map( function(x) {return x._id;});
            //            console.log(foundBarcode);

            var barcodeMatch = false;
            for (var i in foundBarcode) {
                if (foundBarcode[i] === barcode && foundBarcode[i] !=='' && foundFoodId2[i] !== theDoc._id) {
                    alert("Tuote samalla viivakoodilla löytyy jo tietokannasta!");
                    barcodeMatch = true;
                    return false;
                }
            }

            if (barcodeMatch === false && nameAndM_match === false) {

                if (target.image.files[0] === undefined) {
                    if(removeImage === false) {
                        file_id = theDoc.image_id; // retain image if new one not given & remove checkbox unchecked
                    }
                    else if (removeImage === true) {
                        Images.remove(theDoc.image_id);  // file_id default value is 0
                    }
                    //console.log("no image, file_id: "); console.log(file_id);
                    Meteor.call('fuuditest.update', Name, energy, carbs,
                            sugar, fat, salt, prot, fiber, file_id, category, manufacturer, barcode);
                }
                else {
                    Images.insert(event.target.image.files[0], function (err, fileObj) {
                        if (err) {
                            // handle error
                            console.log(err);
                        } else {
                            file_id = fileObj._id;
                            Meteor.call('fuuditest.update', Name, energy, carbs,
                                        sugar, fat, salt, prot, fiber, file_id, category, manufacturer, barcode);
                            //console.log("theDoc.image_id"); console.log(theDoc.image_id);
                            if(theDoc.image_id !== undefined && theDoc.image_id !== 0) {
                                Images.remove(theDoc.image_id);  // remove old image
                            }
                        }
                    });
                }
                target.name.value = '';  // Clear form
                target.energy.value = '';
                target.carbs.value = '';
                target.sugar.value = '';
                target.fat.value = '';
                target.salt.value = '';
                target.prot.value = '';
                target.fiber.value = '';
                //target.category.value = null; // to do: how to clear select
                target.manufacturer.value = '';
                target.barcode.value = '';
                if (event.target.image.files[0]) {
                    //event.target.image.files[0] = '';  // to do: how to clear image selection
                }
            }  /* barcodeMatch  && nameAndM_match */
        }, 
        'change [type=checkbox]': function(){
            var remImbCBval = Session.get('fileRemoveCB');
            if(remImbCBval == false) remImbCBval = true;
            else remImbCBval = false;
            Session.set('fileRemoveCB', remImbCBval)
        },
    });
/*----------------------------------------------------------------------------------------------------*/
    Template.editform.onRendered(function () {

        $('.food-edit-body').validate({
            messages: {
                name: 'Required'
            }
        });
        Session.set('fileRemoveCB', false); // file remove checkbox

        var inputs = document.querySelectorAll('.myFileInput2');
        Array.prototype.forEach.call(inputs, function (input) {
            var label = input.nextElementSibling,
				labelVal = label.innerHTML;

            input.addEventListener('change', function (e) {
                var fileName = '';
                fileName = e.target.value.split('\\').pop();
                if (fileName === '') {
                    fileName = 'lataa kuva';
                }
                label.querySelector('span').innerHTML = fileName;
            });
        });
    });
/*----------------------------------------------------------------------------------------------------*/
    Template.editform.helpers({
        distinct_categories() {

	var ready = Meteor.subscribe('fuuditest').ready();
    var allCategories;

    var allFood = Foods.find({},  {
        sort: {kategoria: 1}, fields: {kategoria: true}
    });

    if (ready) {
        var result = [];
        allCategories = allFood.map( function(x) {return x.kategoria;});
				
        for (var c in allCategories) {
            if (allCategories[c] !== undefined && allCategories[c] !== "") {
                result[result.length] = allCategories[c];
            }
        }
    }

    return {
        categories: _.uniq(result),
        ready: ready
    };
},

});
/*----------------------------------------------------------------------------------------------------*/
Template.registerHelper('storeCat', function(category) {
    Session.set('itemCategory', category);
//    console.log('storeCat');
});
Template.registerHelper('selectedHelper', function(choice) {  // choice.kategoria ???
    var storedCat = Session.get('itemCategory');
    if(storedCat === choice) {
        return 'selected';
    }
    else return '';
});
Template.registerHelper('image_name', function() { // 
    var docFileName = 'lataa kuva';
    var docImgName = Session.get('docFileName');
    if (docImgName !== undefined && docImgName !== '') {
        docFileName = docImgName;
    }
    return docFileName;
});   
Template.registerHelper('remove_image_checkbox', function() { // generate code if necessary
    var result=false;
    var docImgName = Session.get('docFileName');
    if (docImgName !== undefined && docImgName !== '') {
        result = true;
    }
    return result;
});
Template.registerHelper('store_doc_id', function(id) { // search result different than picking from category
    var doc = Foods.find({_id: id}).fetch();
    Session.set('theDoc', doc[0]);
});
/*----------------------------------------------------------------------------------------------------*/
} /* Meteor.isClient */