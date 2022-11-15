import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import re, sys
import preprocessor as p
from keras.preprocessing.sequence import pad_sequences
from initializer import loaded_model, tokenizer, stop_words, ps

def regexCleaning(text):
  text = p.clean(text)
  text = re.sub('[^a-zA-Z]| {2,}',' ',text)
  text = text.lower()
  text = text.split()
  text = [ps.stem(word) for word in text if word not in stop_words]
  text = ' '.join(text)
  if(len(text)):
    return text
  else:
    pass

def output(sentence):
  sentence = [regexCleaning(sentence)]
  if(None in sentence):
    print(0)
    return
  seq = tokenizer.texts_to_sequences(sentence)
  seq_padded = pad_sequences(seq, maxlen=50, truncating="post", padding="post")
  prediction = (loaded_model.predict(seq_padded) > 0.5).astype("int32")
  if(prediction):
    print(1)
  else:
    print(0)

output(str(sys.argv[1]))