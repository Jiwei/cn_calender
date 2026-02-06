/**
 * XIALI Mini Program - Calendar Grid Component
 * Pure presentation component - receives data, renders UI
 */
Component({
  properties: {
    viewMode: {
      type: String,
      value: 'lunar'
    },
    days: {
      type: Array,
      value: []
    }
  },

  methods: {
    onDayTap(e) {
      const index = e.currentTarget.dataset.index;
      const day = this.data.days[index];
      this.triggerEvent('daytap', { day, index });
    }
  }
});
