if (Meteor.isClient) {

	Template.foods.events({
		'click .fab': function(event) {
			Router.go('/foods/add')
	    },
	    'dblclick .food-item': function (event) {
	        //console.log("T foods: dblclick"); console.log(this.name);
	        Session.set('theDoc', this);
	        Router.go('/foods/edit')
	    },
	});

	Template.food.events({
		'click .fab': function(event) {
			Router.go('/foods/add')
		},
	});

	Template.categories.events({
		'click .fab': function(event) {
			Router.go('/foods/add')
		},
	});

	Template.subcategories.events({
		'click .fab': function(event) {
			Router.go('/foods/add')
		},
	});
	Template.editform.helpers({
	    formData: function () {
	        var document = Session.get('theDoc');
            if (document.image_id !== undefined && document.image_id !== 0) { // undef for fineli items and 0 for items added with app
                var queryRes = Images.find({ _id: document.image_id }).fetch(); //, {"original.name":1}); // it's an embedded document
                var docFileNameArr = queryRes.map(function (doc) { return doc.original.name; });
                if (docFileNameArr.length > 0) {  // found it
                    Session.set('docFileName', docFileNameArr[0]);  //console.log(docFileName);
                }
            }
            else {
                Session.set('docFileName', '');
            }
	        return document;
	        //return fuuditest.findOne({ _id: document });
	    }
	})
}