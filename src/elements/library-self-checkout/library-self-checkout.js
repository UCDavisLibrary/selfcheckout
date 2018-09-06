import { PolymerElement, html } from './node_modules/@polymer/polymer/polymer-element.js';
import './node_modules/@polymer/polymer/lib/elements/dom-repeat.js';

import './node_modules/@polymer/iron-ajax/iron-ajax.js';
import './node_modules/@polymer/iron-flex-layout/iron-flex-layout.js';
import './node_modules/@polymer/iron-input/iron-input.js';
import './node_modules/@polymer/iron-icons/iron-icons.js';

import './node_modules/@polymer/paper-toast/paper-toast.js';
import './node_modules/@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import './node_modules/@polymer/paper-dialog/paper-dialog.js';
import './node_modules/@polymer/paper-spinner/paper-spinner.js';
import './node_modules/@polymer/paper-icon-button/paper-icon-button.js';

import './node_modules/@polymer/neon-animation/animations/scale-up-animation.js';
import './node_modules/@polymer/neon-animation/animations/fade-out-animation.js';
//import './node_modules/web-animations-js/web-animations.min.js';

import template from "./template.js";
import style from "./style.js";

//import logo_header from "./img/librarylogo-icon-white.svg";
//import logo_header from "./img/ucd-logo-main-new-white.png";
//console.log(logo_header);

class LibrarySelfCheckout extends PolymerElement {
    static get template() {
        return html([template + style]);
    }

    static get properties() {
        return {
            init: {
                type: String,
                value: ""
            },
            library: {
                type: String,
                value: ""
            },
            circdesk: {
                type: String,
                value: ""
            },
            verbose: {
                type: Boolean
            },
            valid_sid: {
                type: Boolean,
                value: false,
            },
            alma_key: {
                type: String
            },
            user_query: {
                type: String,
                observer: 'lookup_user'
            },
            user_url: {
                type: String,
                observer: 'get_user_data'
            },
            user_name: {
                type: String
            },
            user_loan_count: {
                type: Number,
                value: -1,
                observer: 'get_user_loans'
            },
            checkout_count: {
                type: Number,
                value: 0
            },
            loans_retrived: {
                type: Boolean,
                value: false
            },
            has_loans: {
                type: Boolean,
                value: false,
                computed: '_has_loans(user_loan_count)',
                observer: '_display_loans'
            },
            user_loans: {
                type: Array,
                value: []
            },
            logout_time: {
                type: Number,
                value: 20000
            },
            use_proxy: {
                type: Boolean,
                value: false
            }
        }
    }
    constructor() {
        super();
    }

    ready(){
        super.ready();
        this.interval_user = "";
        this.interval_barcode = "";
        this.timeout = "";
        this.$.cardreader.getElementsByTagName('input')[0].focus();

        if (this.use_proxy) {
            if (this.alma_key) {
                console.warn("Found both alma_key and use_proxy parameters. Starting element in proxy mode... ");
            }
        }
        else {
            this.$.ajax_checkout.contentType = "application/xml";
        }
        var element = this;

        // Attach listeners
        // Listener for SID input
        this.$.cardreader.addEventListener('iron-input-validate', function(){
            /* Sets interval wait time based on validation status
                to ensure user is done entering value
                _wait_for_sid calls user API */
            var valid_sid = element._validate_sid(element);
            if (element.interval_user) {
                clearInterval(element.interval_user);
            }
            if (valid_sid) {
                element.interval_user = setInterval(element._wait_for_sid.bind(element), 1000);
            }
            else {
                element.interval_user = setInterval(element._wait_for_sid.bind(element), 3000);
            }

            if ( element.valid_sid != valid_sid){
                element.set('valid_sid', valid_sid);
                if (element.verbose) {
                    console.log("SID validation updated. New value:",
                                element.$.cardreader.bindValue, valid_sid);
                }

            }
        })

        // Listener for barcode input
        this.$.barcode.addEventListener('iron-input-validate', function(){
            /*
             Sets interval wait time based on barcode length
                to ensure user is done entering value
                _wait_for_barcode posts to API
            */

            element.$.barcode.invalid = false; // just for css
            var barcode = element.$.barcode.bindValue;
            if (element.interval_barcode) {
                clearInterval(element.interval_barcode);
            }
            if (barcode.length == 0) {
                return;

            }
            else if (barcode.length < 10){
                element.interval_barcode = setInterval(element._wait_for_barcode.bind(element), 3000);
            }
            else {
                element.interval_barcode = setInterval(element._wait_for_barcode.bind(element), 750);
            }
            if (element.timeout) {
                clearTimeout(element.timeout)
            }
            element.timeout = setTimeout(element.logout_user.bind(element), element.logout_time);
        })

        // Listener for closing loan window.
        this.$.details_window.addEventListener('iron-overlay-closed', function(){
            element.$.barcode.getElementsByTagName('input')[0].disabled = true;
            element.$.cardreader.getElementsByTagName('input')[0].disabled = false;
            element.$.cardreader.getElementsByTagName('input')[0].focus();
            if (element.verbose){
                console.log("Closing details window");
            }
            //element.reset_element();
        })

        // Listener for opening loan window.
        this.$.details_window.addEventListener('iron-overlay-opened', function(){
            element.$.barcode.getElementsByTagName('input')[0].disabled = false;
            element.$.cardreader.getElementsByTagName('input')[0].disabled = true;
            element.$.barcode.getElementsByTagName('input')[0].focus();
            element.timeout = setTimeout(element.logout_user.bind(element), element.logout_time);
            if (element.verbose) {
                console.log("Opening details window");
            }

        })

        // Listener for keeping focus on barcode input
        this.$.barcode.getElementsByTagName('input')[0].addEventListener('blur', function(){
            if ( element.$.details_window.opened && !element.$.progress_cont.opened) {
                this.focus();

            }
        })

        // Listener for keeping focus on cardreader input
        this.$.cardreader.getElementsByTagName('input')[0].addEventListener('blur', function(){
            if (!element.$.details_window.opened && !element.$.progress_cont.opened) {
                this.focus();
            }
        })

        // Listener for displaying error message when loan is unsuccessful
        this.$.ajax_checkout.addEventListener('last-error-changed', function(){
            if (!this.lastError) {
                return
            }
            try {
                var error_message = this.lastError.response.errorList.error[0].errorMessage;
            } catch (e) {
                var error_message = "An unkown error occurred.";
            }
            element._toast_error("Unable to checkout item: " + error_message + ". See circulation desk for assistance", "details");

            if (element.verbose){
                console.log(error_message);
            }
        })

        this.payload = "<?xml version='1.0' encoding='UTF-8'?><item_loan><circ_desk>";
        this.payload += (this.circdesk + "</circ_desk><library>");
        this.payload += (this.library + "</library></item_loan>");

        if (!this.library || !this.circdesk) {
            this._toast_error("Unable to checkout items. Set library and circdesk attributes and reload element", "body");
        }

        this.$['pt-red-details'].fitInto = this.$.details_window;
        this.$['pt-green-details'].fitInto = this.$.details_window;


    }

    _validate_sid(element){
        /* Method for validating value entered in cardreader field.
            Should be a student id, employee id, or barcode.
            Called for ANY change to text field.
         */
        var sid = element.$.cardreader.bindValue;
        if (sid == "") {
            return false
        }
        element.$.cardreader.invalid = false; // just for css
        var status;
        if (sid.length >= 9) {
            status = true;

            if (sid.length >= 36) {
                status = true
            }
            else if (sid.length <= 11){
                status = true;
            }
            else {
                status = false
            }

        }
        else {status = false;}
        return status
    }

    lookup_user(sid, oldValue=""){
        /* Queries Alma User API Endpoint to verify student id has an account*/

        if (sid == "") {
            return;
        }

        if (this.verbose) {
            console.log("Querying Alma API for user:", sid);
        }
        if (this.use_proxy) {
            this.$.ajax_user.url = "/alma/users";
            var params = {"q": "identifiers~"+sid,
                            "limit": 1,
                            "format": 'json'}

        }
        else {
            var params = {"q": "identifiers~"+sid,
                            "limit": 1,
                            "apikey": this.alma_key,
                            "format": 'json'}
        }



        this.$.ajax_user.params = params;
        let request = this.$.ajax_user.generateRequest();
        this._open_progress('Looking up your account');
        var element = this;
        request.completes.then(function(req) {
            var response = req.response;
            if (element.verbose) {
                console.log("User Query Object: ", response);
            }
            if (response.total_record_count == 0){;
                element.$.cardreader.invalid = true
                element._toast_error("No library account found. See circulation desk for assistance", "body");
                element.reset_element(true);
            }
            else if(response.total_record_count > 0) {
                element.$.cardreader.bindValue = "";
                element.set('user_url', response.user[0].link);

            }
            else {
                element._toast_error("Unable to connect with checkout system. See circulation desk for assistance", "body");
                element.reset_element()
            }
        }, function(rejected) {
            let req = rejected.request;
            let error = rejected.error;
            element.$.cardreader.invalid = true;
            element._toast_error("Unable to connect with checkout system. See circulation desk for assistance", "body");
            element.reset_element(true)
            if (element.verbose) {
                console.log(request, error);
            }
        }
    )
    }

    _wait_for_sid() {
        /* Interval function used to wait for SID entry completion.
            Change in user_query fires API call.
        */
        clearInterval(this.interval_user);
        var sid = this.$.cardreader.bindValue;
        if (sid.length >= 36){
            // Input likely from card. Need to extract SID
            sid = sid.slice(-11,-2);
            if (this.verbose) {
                console.log("ID extracted from swipe:", sid);
            }
        }
        if ( this.valid_sid ){
            this.set('user_query', sid);
        }
        else if (sid == "") {return}
        else {
            this.reset_element(true)
            this._toast_error("Not a valid ID. See circulation desk for assistance", "body")
        }
    }

    _wait_for_barcode() {
        /* Interval function used to wait for barcode entry completion.
            Change in __ fires API call.
        */
        clearInterval(this.interval_barcode);
        var barcode = this.$.barcode.bindValue;
        var url = this.user_url + "/loans";
        this.$.barcode.bindValue = "";
        this.checkout_item(barcode, url);
    }

    _toast_error(text, location) {
        /* Opens error paper toast*/
        var pt_id = "pt-red-" + location;
        var pt = this.$[pt_id];
        pt.text = text;
        pt.open();
    }

    _toast_success(text, location) {
        /* Opens error paper toast.*/
        var pt_id = "pt-green-" + location;
        var pt = this.$[pt_id];
        pt.text = text;
        pt.open();
    }

    _open_progress(text) {
        /* Opens progress overlay window with specified text*/
        this.$.progress_text.textContent = text;
        this.$.progress_spin.active = true;
        this.$.progress_cont.open();
    }

    _close_progress(){
        /* Opens progress overlay window. */
        this.$.progress_spin.active = false;
        this.$.progress_cont.close();
    }

    reset_element(was_error=false){
        /* Performs functions required to return element to main screen.*/
        if (this.verbose) {
            console.log("Reseting element");
        }
        this._close_progress();
        this.$.details_window.close();
        this.$.barcode.invalid = false;

        this.$.cardreader.bindValue = "";
        this.$.cardreader.getElementsByTagName('input')[0].focus();
        if (was_error) {
            this.$.cardreader.invalid = true;
        }
        this.set('user_query', "");
        this.set('user_url', "");
        this.set('user_name', "");
        this.set('user_loan_count', -1);
        this.set('checkout_count', 0);
        this.set('user_loans', []);
        this.set('loans_retrived', false);
    }

    checkout_item(barcode, url) {
        /* Sends POST request to Alma user loan api to checkout item associated with barcode.
            Adds loan object to user_loans property, which updates display.
        */
        this._open_progress('Checking out item');
        if (this.verbose) {
            console.log("Checking out item:", barcode);
            console.log("API Endpoint:", url);
        }

        var params = {"format": 'json',
                        'item_barcode': barcode}
        if (this.use_proxy) {
            url = "/alma/" + url.split('v1/')[1];
            this.$.ajax_checkout.body = {xmlstr: this.payload};
            this.$.ajax_checkout.contentType = 'application/json';
        }
        else {
            params['apikey'] = this.alma_key;
            this.$.ajax_checkout.body = this.payload;
        }
        this.$.ajax_checkout.params = params;
        this.$.ajax_checkout.url = url;

        let request = this.$.ajax_checkout.generateRequest();
        var element = this;
        request.completes.then(function(req) {
            var response = req.response;
            if (element.verbose) {
                console.log("Checked out Loan Object: ", response);
            }
            element._close_progress();
            element.$.barcode.getElementsByTagName('input')[0].focus();
            for (var i = 0; i < element.user_loans.length; i++) {
                if (element.user_loans[i].loan_id == response.loan_id){
                    if (element.verbose){
                        console.log("Item already checked out.");
                    }
                    element._toast_error('You have already checked out this title. See circulation desk for assistance.', 'details');
                    return;
                }
            }
            response.loan_date = "now";
            response.ld_class = 'today';
            response.animation = "last_checkout";
            element.splice('user_loans', 0, 0, response);
            element.user_loan_count += 1;
            element.checkout_count += 1;

            // Apply animation if animations api exists
            // Had to use timeout function to work reliably with dom-repeat
            var last_checkout = element.$.loan_table.children[1];
            setTimeout(function(){
                var last_checkout = element.$.loan_table.children[1];
                if ( typeof(last_checkout.animate) === 'function' ) {
                    console.log("running checkout animation...");
                    last_checkout.animate({
                            backgroundColor: [ "inherit", "#99c75f", "inherit"],
                        }, {'duration': 3000});

                }
                else {
                    element._toast_success('Checked out: ' + response.title, 'details');
                }

            }, 250);

            element._fix_scrollhieght();



        }, function(rejected) {
            let error = rejected.message;
            element.$.barcode.invalid = true;
            element.response = rejected;
            element._close_progress()
            element.$.barcode.getElementsByTagName('input')[0].focus();

            if (element.verbose) {
                console.log(error);
            }
        }
        )

    }

    get_user_data(url, oldValue=""){
        /* Queries Alma User API Endpoint to get full account info.
            Calls primary overlay window after conditions are passed.
        */
        if (url == ""){
            return
        }
        if (this.verbose) {
            console.log("Querying Alma API for user:", url);
        }
        var params = {"format": 'json',
                        'view': 'full',
                        'expand': 'loans,requests,fees'}
        if (this.use_proxy) {
            this.$.ajax_user_full.url = ("/alma/" + url.split("v1/")[1]);
        }
        else {
            params['apikey'] = this.alma_key;
            this.$.ajax_user_full.url = url;
        }
        this.$.ajax_user_full.params = params;

        let request = this.$.ajax_user_full.generateRequest();
        var element = this;
        request.completes.then(function(req) {
            var response = req.response;
            if (element.verbose) {
                console.log("Full User Object: ", response);
            }

            if (new Date(response.expiry_date) <= new Date()){
                element._toast_error("You are unable to checkout items since your account has expired. See circulation desk for assistance", "body");
                element.reset_element(true);
            }
            else if (response.fees.value > 0) {
                element._toast_error("You are unable to checkout items since you have outstanding loans. See circulation desk for assistance", "body");
                element.reset_element(true);
            }
            else {
                // Start to populate detailed user view.
                element.set('user_name', response.full_name);
                element.set('user_loan_count', response.loans.value)
            }

        }, function(rejected) {
            let req = rejected.request;
            let error = rejected.error;
            element._toast_error("Unable to connect with checkout system. See circulation desk for assistance", "body");
            element.reset_element(true)
            if (element.verbose) {
                console.log(request, error);
            }
        }
        )

    }
    get_user_loans(loan_count, oldValue=""){
        /* Queries Alma User Loan API Endpoint for all loans if they exist.
            Opens popup window to allow user to checkout items.
        */

        if (loan_count == -1) {
            return;
        }
        else if (loan_count == 0) {
            // No loans to retrieve
            this._close_progress();
            this.$.details_window.open();
            this.loans_retrived = true;
            return;
        }
        else if (this.loans_retrived) {
            this._close_progress();
            this.$.details_window.open();
            return;
        }
        var url = this.user_url + "/loans";
        if (this.verbose) {
            console.log("Querying Alma API for items:", url);
        }
        this.$.progress_text.textContent = "Retrieving your loans";

        var params = {"format": 'json',
                        'limit': 100,
                        'order_by': 'loan_date',
                        'direction': 'DESC'}
        if (this.use_proxy) {
            url = '/alma/' + url.split('v1/')[1];
        }
        else {
            params['apikey'] = this.alma_key;
        }
        this.$.ajax_user_loans.params = params;
        this.$.ajax_user_loans.url = url;
        let request = this.$.ajax_user_loans.generateRequest();
        var element = this;
        request.completes.then(function(req) {
            var response = req.response;
            if (element.verbose) {
                console.log("Full Loan Object: ", response);
            }
            element.set('user_loans', response.item_loan)
            element._close_progress();
            element.set('loans_retrived', true);
            element.$.details_window.open();

        }, function(rejected) {
            let req = rejected.request;
            let error = rejected.error;
            element._toast_error("Unable to load your active loans. See circulation desk for assistance", "body");
            element.reset_element(true)
            if (element.verbose) {
                console.log(request, error);
            }
        }
        )
    }

    logout_user(e){
        /* Logs out user and resets element.
            Called by user or by timeout
        */
        if (this.timeout){
            clearTimeout(this.timeout);
        }
        if (e) {
            var message = "You have been logged out. ";
        }
        else {
            var message = "You have been automatically logged out due to inactivity. ";
        }

        if (this.checkout_count > 1) {
            message += String(this.checkout_count) + " items were successfully checked out.";
        }
        else if (this.checkout_count == 1) {
            message += String(this.checkout_count) + " item was successfully checked out.";
        }
        else {
            message += "No items were checked out.";
        }
        this.reset_element();
        this._toast_success(message, 'body');

    }
    _format_loan_date(dt) {
        /*Formats loan date string in loan table*/
        if (dt == 'now'){
            return "Just Now"
        }
        var dt = new Date(dt);
        var today = new Date();
        today.setHours(0,0,0,0);

        var options = {'month':'short', year: 'numeric', day: 'numeric'}
        var dt_str = dt.toLocaleDateString('en-US', options)
        return dt_str
    }

    _format_due_date(dt) {
        /*Formats due date string in loan table*/
        var dt = new Date(dt.split("T")[0]);
        var today = new Date();
        today.setHours(0,0,0,0);

        var options = {'month':'short', year: 'numeric', day: 'numeric'}
        var dt_str = dt.toLocaleDateString('en-US', options)
        if (dt < today){
            return "Overdue"
        }
        return dt_str;
    }

    _has_loans(loan_ct) {
        /* Computed property for loan count.
            Used in conjunction with _display_loans observer.
        */
        if ( !loan_ct) {
            return false;
        }

        if (loan_ct > 0) {
            return true;
        }
        return false;
    }
    _display_loans(newValue, oldValue){
        /* Observer for has_loans.
            Displays loan table if loans exist.
            Workaround for domif, which wasn't playing nice with the other elements.
        */
        var ls = this.$.loan_scroll;
        var ln = this.$.loan_none;

        if (newValue == true) {
            ln.setAttribute('class', 'hidden');
            ls.removeAttribute('class');

            this._fix_scrollhieght;
        }
        else {
            ls.setAttribute('class', 'hidden');
            ln.removeAttribute('class');
        }
    }

    _fix_scrollhieght(){
        // Awful little hack for ensuring the scroll region is correct
        var s = this.$.loan_scroll.$.scrollable.getAttribute('style');
        if (s){
            var h = this.$.loan_scroll.scrollHeight;
            s = s.split(";");
            var s2 = "";
            for (var i = 0; i < s.length; i++) {
                if (s[i].includes('max-height')){
                    s2 += 'max-height:' + String(h)+"px";
                    s2 += ";";
                }
                else if ( s[i] == " " || s[i] == "") {}
                else if( s[i].includes('max-width')){}
                else{
                    s2 += s[i];
                    s2 += ";";
                }
            }
            this.$.loan_scroll.$.scrollable.setAttribute('style', s2);
            if (this.verbose) {
                console.log("updating scroll style", s2);
            }
        }
    }
}

customElements.define('library-self-checkout', LibrarySelfCheckout);
