window.addEventListener('DOMContentLoaded', function() {
    var formular = document.getElementById("form_inreg");
    if (formular) {
        formular.onsubmit = function() {
            if (
                document.getElementById("parl").value !=
                document.getElementById("rparl").value
            ) {
                alert(
                    'Nu ati introdus acelasi sir pentru campurile "parola" si "reintroducere parola".'
                );
                return false;
            }

            var frm = document.querySelector('#form_inreg');
            var requiredElem = form.querySelectorAll('[required]');
            let printedString = ""
            for (let r of requiredElem)
                if (r.value == "")
                    printedString += (r.name + "\n");
            if (printedString != "") {
                alert('The following fields are empty ' + printedString);
                return false;
            }
            return true;
        };
    }
});