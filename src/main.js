require('webpack-icons-installer');
import {DiscoveryService} from "./ds-client";
import {DiscoveryComponent} from "./component";
import './assets/login.css';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/ra21icon.svg';


let mdq_url = null;
let storage_url = "local://";
let defaultText = "Your Institution";
let return_url = window.xprops.returnURL;
let on_discovery = function () { window.top.location.href = return_url; };
let on_institution_clicked = function(url, entity_id) { window.top.location.href = url; };

document.getElementById('main').style.background = window.xprops.backgroundColor;

if (window.xprops.StorageURL) {
    storage_url = window.xprops.StorageURL;
}

if (window.xprops.MDQ) {
    mdq_url = window.xprops.MDQ;
}

if (window.xprops.onDiscovery) {
    on_discovery = window.xprops.onDiscovery;
}

if (window.xprops.onInstitutionClicked) {
    on_institution_clicked = window.xprops.onInstitutionClicked;
}

let ds = new DiscoveryService(mdq_url, storage_url);

let start = Promise.resolve();
if (window.xprops.pinned) {
    start = ds.pin(window.xprops.pinned);
}

start.then(function() {
    let count = 0;
    ds.with_items(function (items) {
        let button = document.getElementById('idpbutton');
        let dsbutton = document.getElementById('dsbutton');
        let entity_id = "";
        if (items && items.length > 0) { // or things have gone very wrong...
            let item = items[items.length-1];
            if (item && item.entity && item.entity.title && item.entity.entityID) { // silly
                document.getElementById('spinner').style.display = "none";
                document.getElementById('title').innerText = item.entity.title;
                entity_id = item.entity.entityID;
                document.getElementById('headline').innerText = "Access Through";
                count += 1;
            }
        }

        if (count == 0) {
            document.getElementById('spinner').style.display = "none";
            document.getElementById('title').innerText = "Institution";
            document.getElementById('headline').className = "ra21CTAtitle";
            document.getElementById('headline').innerText = "Access Through Your";
            button.dataset['href'] = "";
        }

        button.addEventListener('click', function(event) {
            event.preventDefault();
            setTimeout(function() {
                let params = {'return': window.xprops.returnURL};
                if (entity_id) { // return the discovery response
                    ds.do_saml_discovery_response(entity_id, params).then(function (url) {
                        on_institution_clicked(url, entity_id);
                    });
                } else { // off to DS
                    on_discovery();
                }
                window.xchild.close();
            }, 1000);
        });

        dsbutton.addEventListener('click', function(event) {
            event.preventDefault();
            setTimeout(function() {
                on_discovery();
                window.xchild.close();
            }, 1000);
        });

        return items;
    });
});