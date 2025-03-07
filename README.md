# Video Flashcards Converter
## TODO
- extract the entire audio file using ffmpeg and pass that to each card
- make a separate audio editor component
    - add parameters for an audio File and also min, max, start, setStart, end, and setEnd, which are all numbers
    - include an audio component to play the audio file
    - show a waveform of the audio file from min to max
    - highlight the section of the waveform between start and end
    - show a vertical bar on the waveform indicating the current value of the audio component
    - clicking on the left side of the waveform sets the start value based on where it was clicked
    - clicking on the right side of the waveform sets the end value based on where it was clicked
    - include a field with plus and minus buttons for start and another for end
    - whenever start or end are changed, start playing the audio file from start and pause it when it gets to end