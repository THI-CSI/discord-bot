const Event = require('../../../structures/Event');

module.exports = class extends Event {
    constructor(...args) {
        super(...args, {
            once: true,
            isActive: true
        });
    }

    async run(interaction) {

        // Check type of interation. We're only interested in Messages and Application Commands (I.e.: /authenticate, /sweep)
        if(interaction.type === 3) {

            /*
            We detected a Message Component Event!

            Now we just need to figure out what Component it exactly was and reroute the interaction to the corresponding internal Event
            */

            switch (interaction.componentType) {
                case 3: {
                    // Select Menu
                    this.client.emit(`SelectMenuInteraction`, interaction);
                }
                break;
                case 2: {
                    // Button
                    this.client.emit(`ButtonInteraction`, interaction);
                }
                break;
            }


        } else if (interaction.type === 2) {

            /*
            We detected an Application Command Event - Lets reroute to the according internal Event.
            */
            this.client.emit(`CommandInteraction`, interaction);
        }

        //TODO Logging
        // Add some info for every Interaction usage...

    }
}