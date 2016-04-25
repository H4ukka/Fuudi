if (Meteor.isClient) {	
	Template.mockup.onRendered(function() {

		var cookie = Cookies.get('K9yV4xPwGg');

		Meteor.subscribe('getVisitorCount');
		
		if(cookie) {

		}else{

			var user_agent = navigator.userAgent;

			Meteor.call('visitors.insert', user_agent);

			var year = new Date(); 
			year.setTime(year.getTime() + 365 * 24 * 60 * 60 * 1000); 
	  		Cookies.set('K9yV4xPwGg', '1', { expires: year, path: '' });
		}
	});
}